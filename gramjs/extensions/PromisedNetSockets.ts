import * as net from "./net";
import * as http from "http";
import { SocksClient } from "./socks";

import { Mutex } from "async-mutex";
import {
    ProxyInterface,
    SocksProxyType,
    HttpProxyType,
} from "../network/connection/TCPMTProxy";

const mutex = new Mutex();

const closeError = new Error("NetSocket was closed");

export class PromisedNetSockets {
    private client?: net.Socket;
    private closed: boolean;
    private stream: Buffer;
    private canRead?: boolean | Promise<boolean>;
    private resolveRead: ((value?: any) => void) | undefined;
    private proxy?: SocksProxyType | HttpProxyType;

    constructor(proxy?: ProxyInterface) {
        this.client = undefined;
        this.closed = true;
        this.stream = Buffer.alloc(0);
        if (proxy) {
            // we only want to use this when it's not an MTProto proxy.
            if (!("MTProxy" in proxy)) {
                if ("httpProxy" in proxy) {
                    // HTTP прокси
                    if (!proxy.ip || !proxy.port) {
                        throw new Error(
                            `Invalid HTTP proxy params: ip=${proxy.ip}, port=${proxy.port}`
                        );
                    }
                    this.proxy = proxy;
                } else if ("socksType" in proxy) {
                    // SOCKS прокси
                    if (!proxy.ip || !proxy.port || !proxy.socksType) {
                        throw new Error(
                            `Invalid SOCKS proxy params: ip=${proxy.ip}, port=${proxy.port}, socksType=${proxy.socksType}`
                        );
                    }
                    this.proxy = proxy;
                }
            }
        }
    }

    async readExactly(number: number) {
        let readData = Buffer.alloc(0);
        while (true) {
            const thisTime = await this.read(number);
            readData = Buffer.concat([readData, thisTime]);
            number = number - thisTime.length;
            if (!number || number === -437) {
                return readData;
            }
        }
    }

    async read(number: number) {
        if (this.closed) {
            throw closeError;
        }
        await this.canRead;
        if (this.closed) {
            throw closeError;
        }
        const toReturn = this.stream.slice(0, number);
        this.stream = this.stream.slice(number);
        if (this.stream.length === 0) {
            this.canRead = new Promise((resolve) => {
                this.resolveRead = resolve;
            });
        }

        return toReturn;
    }

    async readAll() {
        if (this.closed || !(await this.canRead)) {
            throw closeError;
        }
        const toReturn = this.stream;
        this.stream = Buffer.alloc(0);
        this.canRead = new Promise((resolve) => {
            this.resolveRead = resolve;
        });
        return toReturn;
    }

    /**
     * Creates a new connection
     * @param port
     * @param ip
     * @returns {Promise<void>}
     */
    async connect(port: number, ip: string) {
        this.stream = Buffer.alloc(0);
        let connected = false;
        if (this.proxy) {
            if ("httpProxy" in this.proxy) {
                // HTTP прокси через CONNECT метод
                this.client = await this._connectViaHttpProxy(ip, port, this.proxy);
                connected = true;
            } else if ("socksType" in this.proxy) {
                // SOCKS прокси
                const info = await SocksClient.createConnection({
                    proxy: {
                        host: this.proxy.ip,
                        port: this.proxy.port,
                        type: this.proxy.socksType,
                        userId: this.proxy.username,
                        password: this.proxy.password,
                    },

                    command: "connect",
                    timeout: (this.proxy.timeout || 5) * 1000,
                    destination: {
                        host: ip,
                        port: port,
                    },
                });
                this.client = info.socket;
                connected = true;
            }
        } else {
            this.client = new net.Socket();
        }

        this.canRead = new Promise((resolve) => {
            this.resolveRead = resolve;
        });
        this.closed = false;
        return new Promise((resolve, reject) => {
            if (this.client) {
                if (connected) {
                    this.receive();
                    resolve(this);
                } else {
                    this.client.connect(port, ip, () => {
                        this.receive();
                        resolve(this);
                    });
                }
                this.client.on("error", reject);
                this.client.on("close", () => {
                    if (this.client && this.client.destroyed) {
                        if (this.resolveRead) {
                            this.resolveRead(false);
                        }
                        this.closed = true;
                    }
                });
            }
        });
    }

    write(data: Buffer) {
        if (this.closed) {
            throw closeError;
        }
        if (this.client) {
            this.client.write(data);
        }
    }

    async close() {
        if (this.client) {
            await this.client.destroy();
            this.client.unref();
        }
        this.closed = true;
    }

    async receive() {
        if (this.client) {
            this.client.on("data", async (message: Buffer) => {
                const release = await mutex.acquire();
                try {
                    let data;
                    //CONTEST BROWSER
                    this.stream = Buffer.concat([this.stream, message]);
                    if (this.resolveRead) {
                        this.resolveRead(true);
                    }
                } finally {
                    release();
                }
            });
        }
    }

    /**
     * Подключение через HTTP прокси используя метод CONNECT
     */
    private async _connectViaHttpProxy(
        targetHost: string,
        targetPort: number,
        proxy: HttpProxyType
    ): Promise<net.Socket> {
        return new Promise((resolve, reject) => {
            const timeout = (proxy.timeout || 5) * 1000;
            
            const proxyReq = http.request({
                host: proxy.ip,
                port: proxy.port,
                method: "CONNECT",
                path: `${targetHost}:${targetPort}`,
                timeout: timeout,
                headers: proxy.username && proxy.password
                    ? {
                        "Proxy-Authorization": `Basic ${Buffer.from(
                            `${proxy.username}:${proxy.password}`
                        ).toString("base64")}`,
                    }
                    : {},
            });

            proxyReq.on("connect", (res, socket) => {
                if (res.statusCode === 200) {
                    resolve(socket);
                } else {
                    socket.destroy();
                    reject(
                        new Error(
                            `HTTP proxy connection failed with status ${res.statusCode}`
                        )
                    );
                }
            });

            proxyReq.on("error", (err) => {
                reject(new Error(`HTTP proxy connection error: ${err.message}`));
            });

            proxyReq.on("timeout", () => {
                proxyReq.destroy();
                reject(new Error("HTTP proxy connection timeout"));
            });

            proxyReq.end();
        });
    }

    toString() {
        return "PromisedNetSocket";
    }
}
