# GramJS with HTTP Proxy Support

> **This is a fork of [gram-js/gramjs](https://github.com/gram-js/gramjs)** with added HTTP/HTTPS proxy support.

A Telegram client written in JavaScript for Node.js and browsers, with its core being based on
[Telethon](https://github.com/LonamiWebs/Telethon).

## ✨ What's Different in This Fork

- ✅ **Full HTTP/HTTPS Proxy Support** via CONNECT method
- ✅ **HTTP Proxy Authentication** (username/password)
- ✅ Maintains all original gramjs functionality
- ✅ Regular updates from upstream

> If you don't need HTTP proxy support, use the [original gramjs](https://github.com/gram-js/gramjs) instead.

## How to get started

Here you'll learn how to obtain necessary information to create telegram application, authorize into your account and send yourself a message.

> **Note** that if you want to use a GramJS inside of a browser, refer to [this instructions](https://gram.js.org/introduction/advanced-installation).

Install this fork:

```bash
$ npm install @kirill-kopylov/telegram
```

Or if migrating from original gramjs:

```bash
$ npm uninstall telegram
$ npm install @kirill-kopylov/telegram
```

After installation, you'll need to obtain an API ID and hash:

1. Login into your [telegram account](https://my.telegram.org/)
2. Then click "API development tools" and fill your application details (only app title and short name required)
3. Finally, click "Create application"

> **Never** share any API/authorization details, that will compromise your application and account.

When you've successfully created the application, change `apiId` and `apiHash` on what you got from telegram.

Then run this code to send a message to yourself.

```javascript
import { TelegramClient } from "@kirill-kopylov/telegram";
import { StringSession } from "@kirill-kopylov/telegram/sessions";
import readline from "readline";

const apiId = 123456;
const apiHash = "123456abcdfg";
const stringSession = new StringSession(""); // fill this later with the value from session.save()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your number: ", resolve)
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your password: ", resolve)
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Please enter the code you received: ", resolve)
      ),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again
  await client.sendMessage("me", { message: "Hello!" });
})();
```

> **Note** that you can also save auth key to a folder instead of a string, change `stringSession` into this:
>
> ```javascript
> const storeSession = new StoreSession("folder_name");
> ```

Be sure to save output of `client.session.save()` into `stringSession` or `storeSession` variable to avoid logging in again.

## Running GramJS inside browsers

GramJS works great in combination with frontend libraries such as React, Vue and others.

While working within browsers, GramJS is using `localStorage` to cache the layers.

To get a browser bundle of GramJS, use the following command:

```bash
NODE_ENV=production npx webpack
```

You can also use the helpful script `generate_webpack.js`

```bash
node generate_webpack.js
```

## Using Proxies

This fork supports all proxy types from the original gramjs, plus enhanced HTTP/HTTPS proxy support:

### HTTP/HTTPS Proxy ⭐ (Enhanced in This Fork)

The HTTP proxy implementation uses the standard CONNECT method and supports authentication:

```javascript
const client = new TelegramClient(stringSession, apiId, apiHash, {
  proxy: {
    ip: "proxy.example.com",
    port: 8080,
    httpProxy: true,
    // Optional authentication
    username: "user",
    password: "pass",
    timeout: 10, // seconds
  },
});
```

### SOCKS4/5 Proxy

```javascript
const client = new TelegramClient(stringSession, apiId, apiHash, {
  proxy: {
    ip: "proxy.example.com",
    port: 1080,
    socksType: 5, // 4 or 5
    username: "user", // optional
    password: "pass", // optional
    timeout: 10,
  },
});
```

### MTProxy

```javascript
const client = new TelegramClient(stringSession, apiId, apiHash, {
  proxy: {
    ip: "mtproxy.example.com",
    port: 443,
    secret: "your_secret_here",
    MTProxy: true,
  },
});
```

**Key Features:**
- Standard CONNECT method (works with most HTTP proxies)
- Optional authentication (Basic Auth)
- Configurable timeout
- Full TypeScript support

For more examples, check the [`examples/httpProxyExample.ts`](examples/httpProxyExample.ts) file.

## Calling the raw API

To use raw telegram API methods use [invoke function](https://gram.js.org/beta/classes/TelegramClient.html#invoke).

```javascript
await client.invoke(new RequestClass(args));
```

## Documentation

General documentation, use cases, quick start, refer to [gram.js.org](https://gram.js.org), or [older version of documentation](https://painor.gitbook.io/gramjs) (will be removed in the future).

For more advanced documentation refer to [gram.js.org/beta](https://gram.js.org/beta) (work in progress).

If your ISP is blocking Telegram, you can check [My ISP blocks Telegram. How can I still use GramJS?](https://gist.github.com/SecurityAndStuff/7cd04b28216c49b73b30a64d56d630ab)

## Contributing

This is a fork maintained by [@kirill-kopylov](https://github.com/kirill-kopylov).

For issues specific to HTTP proxy functionality, please [open an issue here](https://github.com/kirill-kopylov/gramjs-http-proxy-support/issues).

For general gramjs questions, refer to the [original project](https://github.com/gram-js/gramjs) or their telegram group [@GramJSChat](https://t.me/gramjschat).

## Syncing with Upstream

This fork is regularly synced with the [original gramjs repository](https://github.com/gram-js/gramjs) to include latest updates and bug fixes.

## License

MIT (same as original gramjs)
