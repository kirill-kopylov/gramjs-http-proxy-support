import { PromisedNetSockets } from "../gramjs/extensions/PromisedNetSockets";
import { HttpProxyType, SocksProxyType } from "../gramjs/network/connection/TCPMTProxy";

describe("HTTP Proxy Support", () => {
    test("should accept HTTP proxy configuration", () => {
        const httpProxy: HttpProxyType = {
            ip: "127.0.0.1",
            port: 8080,
            httpProxy: true,
        };

        expect(() => {
            new PromisedNetSockets(httpProxy);
        }).not.toThrow();
    });

    test("should accept HTTP proxy with authentication", () => {
        const httpProxy: HttpProxyType = {
            ip: "127.0.0.1",
            port: 8080,
            httpProxy: true,
            username: "user",
            password: "pass",
            timeout: 10,
        };

        expect(() => {
            new PromisedNetSockets(httpProxy);
        }).not.toThrow();
    });

    test("should throw error for invalid HTTP proxy params", () => {
        const invalidProxy = {
            ip: "",
            port: 8080,
            httpProxy: true,
        } as HttpProxyType;

        expect(() => {
            new PromisedNetSockets(invalidProxy);
        }).toThrow();
    });

    test("should accept SOCKS proxy configuration", () => {
        const socksProxy: SocksProxyType = {
            ip: "127.0.0.1",
            port: 1080,
            socksType: 5,
        };

        expect(() => {
            new PromisedNetSockets(socksProxy);
        }).not.toThrow();
    });

    test("should work without proxy", () => {
        expect(() => {
            new PromisedNetSockets();
        }).not.toThrow();
    });
});