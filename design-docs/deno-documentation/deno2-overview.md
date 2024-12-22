[Skip to main content](https://deno.com/blog/v2.0#main)  
**Deno 2 is finally here 🎉️**  
[**Learn more \-\>**](https://deno.com/2)  
Dismiss  
Products  
[Docs](https://docs.deno.com/)  
Modules  
Community  
[**Blog**](https://deno.com/blog)  
[**![Deno 2.0][image1]**](https://deno.com/blog)

# **Announcing Deno 2**

October 9, 2024

* ![][image2][Ryan Dahl](https://github.com/ry)  
* [![][image3]](https://github.com/ry)[Bert Belder](https://github.com/piscisaureus)  
* [![][image4]](https://github.com/piscisaureus)[Bartek Iwańczuk](https://github.com/bartlomieju)  
* [![][image5]](https://github.com/bartlomieju)[Andy Jiang](https://github.com/lambtron)  
* [Product Update](https://deno.com/blog?tag=product-update)

*Watch our video announcement.*

## **Announcing Deno 2**

The web is humanity’s largest software platform — building for it means potentially [reaching over 5 billion people](https://www.forbes.com/home-improvement/internet/internet-statistics). But as [web development has accelerated in recent years](https://siteefy.com/how-many-websites-are-there/), it has also become increasingly and unmanageably complex. Before writing a single line of code, developers must deal with tedious configuration and wading through unnecessary boilerplate, when they would rather focus on shipping product and delivering value to users.

Yet despite [these complexities](https://deno.com/learn/nodes-complexity-problem), JavaScript, the language of the web, has [remained the most popular language for the past decade](https://github.blog/news-insights/research/the-state-of-open-source-and-ai/), with TypeScript quickly emerging as number three. This is a testament to JavaScript’s ubiquity and usefulness for web development — and a sign that JavaScript is not going anywhere.

In an effort to simplify web programming, we created Deno: a modern, all-in-one, zero-config toolchain for JavaScript and TypeScript development.

* **Native TypeScript support**  
* **Built on web standards**: Promises, fetch, and ES Modules  
* **Batteries included**: builtin formatter, linter, type checker, test framework, compile to executable, and more  
* [**Secure by default**](https://docs.deno.com/runtime/fundamentals/security/), just like browsers

Today, hundreds of thousands of developers love using Deno, with [repository](https://github.com/denoland/deno) becoming [one of the highest starred Rust project on GitHub](https://github.com/EvanLi/Github-Ranking/blob/master/Top100/Rust.md) second only to the Rust language itself.

While we’ve accomplished a ton in Deno 1, the next major version is focused on using Deno *at scale*. This means seamless interoperability with legacy JavaScript infrastructure and support for a wider range of projects and development teams. All without sacrificing the simplicity, security, and “batteries included” nature that Deno users love.

**Today, we’re thrilled to announce Deno 2**, which includes:

* Backwards compatibility with Node.js and npm, allowing you to run existing Node applications seamlessly  
* Native support for package.json and node\_modules  
* Package management with new deno install, deno add, and deno remove commands  
* A stabilized standard library  
* Support for private npm registries  
* Workspaces and monorepo support  
* Long Term Support (LTS) releases  
* JSR: a modern registry for sharing JavaScript libraries across runtimes

We are also continually improving many existing Deno features:

* deno fmt can now format HTML, CSS, and YAML  
* deno lint now has Node specific rules and quick fixes  
* deno test now supports running tests written using node:test  
* deno task can now run package.json scripts  
* deno doc’s HTML output has improved design and better search  
* deno compile now supports code signing and icons on Windows  
* deno serve can run HTTP servers across multiple cores, in parallel  
* deno init can now scaffold libraries or servers  
* deno jupyter now supports outputting images, graphs, and HTML  
* deno bench supports critical sections for more precise measurements  
* deno coverage can now output reports in HTML

## **Backwards-compatible, forward-thinking**

Deno 2 is backwards compatible with Node and npm. This allows you to not only run Deno in your current Node projects, but also incrementally adopt pieces of Deno’s all-in-one toolchain. For instance, you can use deno install after you clone a Node project to install your dependencies at lightning speed or run deno fmt to format your code without needing Prettier.

Deno 2’s compatibility with Node and npm is robust. Deno 2 understands package.json , the node\_modules folder, and even npm workspaces, allowing you to run Deno in any Node project using ESM. And if there are minor syntax adjustments needed, you can fix them with deno lint \--fix.

Don’t like the clutter of package.json and the node\_modules directory, but still need to use that npm package? You can directly import npm packages using npm: specifiers. Without package.json and the node\_modules folder, Deno will install your package in the global cache. This allows you to write programs with npm dependencies [in a single file](https://deno.com/blog/a-whole-website-in-a-single-js-file) — no dependency manifest, configuration files, or node\_modules needed.

import chalk from "npm:chalk@5.3.0";

console.log(chalk.blue("Hello, world\!"));  
// Hello, world\! (in blue)

For larger projects, a dependency manifest makes it simple to manage your dependencies. Placing an npm: specifier into an import map in a deno.json file allows importing the bare name of the package:

// deno.json  
{  
  "imports": {  
    "chalk": "npm:chalk@5.3.0"  
  }  
}

import chalk from "chalk";

console.log(chalk.blue("Hello, world\!"));  
// Hello, world\! (in blue)

With the ability to import npm packages via the npm: specifier, you can access over 2 million npm modules in Deno. This even includes complex packages such as [gRPC](https://www.npmjs.com/package/@grpc/grpc-js), ssh2, Prisma, temporal.io, duckdb, polars. Deno even supports advanced features like Node-API native addons.

Finally, you can use Deno 2 with your favorite JavaScript framework. Deno 2 supports Next.js, Astro, Remix, Angular, SvelteKit, QwikCity and many other frameworks.

*Running create-next-app with Deno.*

## **Deno is now a package manager with deno install**

Not only does Deno 2 support package.json and the node\_modules folder, it also comes with three important subcommands that allow you to easily install and manage your dependencies.

deno install installs your dependencies at lightning speed. If you have a package.json it will create a node\_modules folder in the blink of an eye. If you don’t use package.json, it will cache all of your dependencies to the global cache.

deno install is 15% faster than npm with a cold cache, and 90% faster with a hot cache. We’re already exceptionally fast here, but expect more improvements, especially in cold cache scenarios, in the coming weeks.

![Package install timings][image6]

deno add and deno remove can be used to add and remove packages to/from your package.json or deno.json. If you’ve used npm install or npm remove before, these will feel very familiar.

![deno add demo 1][image7]

![deno add demo 2][image8]

## **JavaScript Registry**

**Earlier this year we introduced a [modern, open sourced JavaScript registry](https://deno.com/blog/jsr_open_beta) called [JSR](https://jsr.io/)**.

It supports TypeScript natively (you can publish modules as TypeScript source code), handles the module loading intricacies multiple runtimes and environments, only allows ESM, [auto-generates documentation from JSDoc-style comments](https://deno.com/blog/document-javascript-package), and can be used with npm- and npx-like systems (yes, JSR turns TypeScript into .js and .d.ts files, as well).

Because you upload TypeScript to JSR, it has an outstanding understanding of the code that is being published. This allows us to deliver a seamless developer experience for both publishing and consuming modules. If you are interested in the details, you can read our post on [how we architected JSR](https://deno.com/blog/how-we-built-jsr).

*Here is a side-by-side video of publishing a package to npm vs. to JSR.*

## **The Standard Library is now stable**

While there are over 2 million modules available on npm, the process of searching, evaluating, and using a new module can be time consuming. That’s why we’ve been building **the Deno Standard Library** for over 4 years.

**The Standard Library consists of dozens of heavily audited utility modules covering everything from data manipulation, web-related logic, JavaScript-specific functionalities, and more**. It is [available on JSR](https://jsr.io/@std), and can be used by other runtimes and environments.

To give you a sense of what kinds of modules are available in the Deno Standard Library, here is a partial list of the Standard Library modules and their equivalent in npm:

| Deno Standard Library module | npm package |
| ----- | ----- |
| [@std/testing](https://jsr.io/@std/testing) | [jest](https://npmjs.org/package/jest) |
| [@std/expect](https://jsr.io/@std/expect) | [chai](https://npmjs.org/package/chai) |
| [@std/cli](https://jsr.io/@std/cli) | [minimist](https://npmjs.org/package/minimist) |
| [@std/collections](https://jsr.io/@std/collections) | [lodash](https://npmjs.org/package/lodash) |
| [@std/fmt](https://jsr.io/@std/fmt) | [chalk](https://npmjs.org/package/chalk) |
| [@std/net](https://jsr.io/@std/net) | [get-port](https://npmjs.org/package/get-port) |
| [@std/encoding](https://jsr.io/@std/encoding) | [rfc4648](https://npmjs.org/package/rfc4648) |

For a complete list of available packages visit [https://jsr.io/@std](https://jsr.io/@std).

## **Private npm registries**

**Private npm registries in Deno 2 work [the same way they do in Node and npm, with an .npmrc file](https://deno.com/blog/v1.44#support-for-private-npm-registries):**

// .npmrc  
@mycompany:registry=http://mycompany.com:8111/  
//mycompany.com:8111/:\_auth=secretToken

Deno will pick up this .npmrc file automatically, and will let you pull private packages with no additional configuration.

## **Workspaces and monorepos**

**Deno 2 also supports workspaces, which is a robust solution to manage monorepos.** Simply use the workspace attribute in your deno.json to list the member directories:

// deno.json  
{  
  "workspace": \["./add", "./subtract"\]  
}

These members can have separate dependencies, linter and formatter configuration, and more.

Not only does Deno support workspaces for Deno packages, it also understands [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). This means that you can create a hybrid Deno-npm monorepo ([see this example](https://github.com/dsherret/npm-to-deno-workspace-example)), with workspace members that either have a package.json or deno.json:

![This sample monorepo contains a mix of npm members and Deno members.][image9]

*This sample monorepo contains a mix of npm members and Deno members.*  
You can also publish workspace members to JSR by running deno publish. For example, refer to [the Deno Standard Library](https://github.com/denoland/std). No need to manually figure out in what order you need to publish your packages \- just run deno publish, and it will do it all for you.

# **LTS**

Often, development teams in larger organizations need to carefully audit new releases before using them in production. With Deno’s weekly bug-fix releases, and 6 weekly minor releases this can become time-consuming. To make it easier for these teams, **we’re introducing a Long Term Support (LTS) release channel**.

Starting with Deno 2.1, the LTS channel will receive critical bug fixes back-ported for six months, ensuring a stable and reliable base for production use. After six months, a new LTS branch will be created based on the latest stable version. All LTS releases are freely available and MIT licensed, making them accessible to any team that needs a more stable and secure environment.

![Starting with Deno 2.1, we’ll introduce a LTS branch that we’ll maintain and backport critical bug fixes to for six months.][image10]

*Starting with Deno 2.1, we’ll introduce a LTS branch that we’ll maintain and backport critical bug fixes to for six months.*  
Finally, for teams needing advanced support, **we’ve introduced the [Deno for Enterprise program](https://deno.com/enterprise)**. It offers priority support, direct access to our engineers, guaranteed response times, and priority for your feature requests. We’ve partnered with companies like Netlify, Slack, and [Deco.cx](http://deco.cx/) to help their engineers move faster and deliver more value to their users.

## **Deno is fast\!**

We’ve put tremendous effort into making Deno fast across a wide range of real-world scenarios. Our focus is on delivering performance improvements that truly matter in everyday JavaScript and TypeScript development—whether it’s startup time, handling complex requests, or overall efficiency.

While benchmarks can never tell the full story, they can provide insight into where a runtime excels. Here are some benchmarks that showcase Deno’s strengths, demonstrating its ability to deliver top-notch performance for both development and production environments.

![Please refer to the links beneath each chart for further detail and reproducible steps.][image11]

*Please refer to the links beneath each chart for further detail and reproducible steps.*  
**Correction:** [The first HTTP benchmark](https://www.trevorlasn.com/blog/benchmarks-for-node-bun-deno/) shown above was conducted using Deno 1.45, not Deno 2.0. In reality, Deno 2.0 is about 20% slower than indicated here. This difference is due to [our recent disabling of V8 pointer compression](https://github.com/denoland/rusty_v8/pull/1593) to address cases where users exceeded the 4GB heap limit. We plan to re-enable pointer compression soon, as it’s the ideal default for most users, and introduce a deno64 build for those needing larger heaps.

## **FAQs**

### **If Deno is fully backward compatible with Node, why should I use Deno instead of Node?**

While Deno can run Node programs, it’s designed to push JavaScript and TypeScript forward. Deno offers features that Node lacks, such as native TypeScript support, web-standard APIs, a complete toolchain for JavaScript development, and a secure-by-default execution model—all in a single executable with no external dependencies. Using Deno over Node can save you time on setup and configuration, letting you start coding and delivering value faster.

### **Will Deno’s opt-in permission system be in effect when running Node programs?**

Yes, Deno’s secure-by-default execution model applies when running Node programs or importing npm modules, ensuring the same level of security.

### **Why the new logo? What happened to the cute dinosaur mascot?**

Since the beginning, the cute sauropod in the rain has been Deno’s face. Its quirky charm has always been a hallmark of Deno, but the design was never consistent—there were at least two “official” versions and countless variations. With Deno 2.0, we decided it was time for a refresh.

We wanted to keep the essence of the original character that Deno users love while giving it a more refined look to match Deno’s professional and production-grade nature. During the redesign, we realized that the rainy background, while nostalgic, didn’t scale well and often went unnoticed. It was too busy, especially at small sizes, so we had to let it go.

After many iterations, we found that simplifying the design to its core elements struck the right balance—simple and friendly, yet serious and reliable—just like Deno.

(Don’t worry, the cute dino is still here\!)

### **Deno began with an ambitious vision to modernize JavaScript. But with all the work spent on backward compatibility, what’s left of Deno’s original vision?**

Rewriting the entire JavaScript ecosystem isn’t practical. As Deno has scaled beyond small programs, we’ve recognized that supporting Node and npm compatibility is essential—especially for tools like gRPC and AWS SDKs, which are impractical to rewrite from scratch.

But Deno’s goal is not to become a Node clone in Rust or a drop-in replacement. Our aim is to level up JavaScript, moving beyond 2010-era CommonJS and narrowing the gap between server-side and browser environments in a way that developers can adopt practically. We refuse to accept that JavaScript must remain a tangle of mismatched tooling and endless layers of transpilation, unable to evolve.

Deno’s original vision remains central to everything we do. This includes native TypeScript support, built-in web standards like Promises, top-level await, Wasm, fetch, and ES Modules, and a batteries-included toolchain—all packaged in a single, dependency-free executable. And, of course, it is secure by default, just like the web.

Supporting npm is just one step toward making Deno more versatile. Our mission is to provide a modern, streamlined toolchain that enhances the JavaScript experience—not just to support legacy code. While we’ve adjusted our approach, our vision remains the same: to simplify and empower web development.

### **I loved Deno because it didn’t need any config files, but with the new package manager additions, is Deno 2 becoming more like Node, where you need a package.json to add dependencies?**

Not at all. You can still run single-file programs or scripts without any config or dependency manifest—nothing has changed there. The new package management commands (deno install, deno add, and deno remove) are optional tools designed to simplify managing dependencies, whether you use a deno.json or package.json file. They’re especially useful for larger, more complex projects but won’t get in the way if you prefer the simplicity of no configuration.

One of our core goals is that Deno scales down to simple, single-file programs that can import any package without additional ceremony. For example, in contexts like Jupyter notebooks or quick scripts, you can easily do:

import \* as Plot from "npm:@observablehq/plot";

At the same time, Deno scales up to handle large projects with multiple files or even multiple packages, such as in monorepos. This flexibility ensures that Deno is just as effective for small scripts as it is for large, production-grade applications.

### **I have a Fresh project. Are there breaking changes if I upgrade to Deno 2?**

Nope\! Your [Fresh](https://fresh.deno.dev/) project should work out of the box with Deno 2—no changes needed.

### **When should I expect Deno 2 to land on Deno Deploy?**

Any moment now\!

## **What’s next**

Deno 2 takes all of the features developers love about Deno 1.x — zero-config, all-in-one toolchain for JavaScript and TypeScript development, web standard API support, secure by default — and makes it fully backwards compatible with Node and npm (in ESM). This makes not only running Deno in any Node project simple, but also allows incremental adoption of Deno (e.g. running deno fmt or deno lint ) possible in larger, more complex projects. Along with improved package management, JSR, and a slew of features for more advanced development teams, Deno is ready to simplify and accelerate your development today.

However, given Deno’s vast capabilities, we weren’t able to cover everything in a single blog post and video. There are many exciting features and use cases with Deno that we didn’t touch upon. For instance, being able to use [deno compile](https://docs.deno.com/runtime/reference/cli/compiler/) to [turn a JavaScript game into a desktop executable](https://www.youtube.com/watch?v=5wlZDw942J8) with cross compilation (yes, Windows) support. Or Deno’s [Jupyter notebook support](https://docs.deno.com/runtime/reference/cli/jupyter/) that allows you to explore and visualize data in TypeScript and [@observable/plot](https://observablehq.com/plot/). Or generating documentation or a static documentation site from your JSDoc comments and source code with [deno doc](https://docs.deno.com/runtime/reference/cli/documentation_generator/).

![Deno’s features at a glance.][image12]

We invite you to try Deno 2 today and experience the future of JavaScript and TypeScript development. Get started with Deno 2 now:

* [Getting Started with Deno (docs)](https://docs.deno.com/runtime/)  
* [1.x ⇒ 2 Migration Guide](https://docs.deno.com/runtime/reference/migration_guide/)  
* [Deno Tutorial Series](https://docs.deno.com/runtime/tutorials/)  
* [Watch the Deno 2 Announcement Keynote](https://www.youtube.com/watch?v=d35SlRgVxT8)

Join our community and let’s shape the future of JavaScript together\!

---

![Tweet 1][image13]

---

![Tweet 2][image14]

---

![Tweet 3][image15]

---

Deno logo

## **Learn**

* [Node's Security Problem](https://deno.com/learn/nodes-security-problem)  
* [Node's Complexity Problem](https://deno.com/learn/nodes-complexity-problem)  
* [Edge is the Future](https://deno.com/blog/the-future-of-web-is-on-the-edge)

## **Why Deno?**

* [TypeScript Support](https://docs.deno.com/runtime/manual/advanced/typescript/overview/)  
* [Web Standard APIs](https://docs.deno.com/runtime/manual/runtime/web_platform_apis/)  
* [All-in-one Tooling](https://docs.deno.com/runtime/reference/cli/)  
* [Secure-by-default](https://docs.deno.com/runtime/manual/basics/permissions)

## **Use Cases**

* [Scripts and CLIs](https://deno.com/learn/scripts-clis)  
* [API Servers](https://deno.com/learn/api-servers)  
* [Sites and Apps](https://deno.com/learn/websites-apps)  
* [Modules](https://deno.com/learn/modules)  
* [Serverless Functions](https://deno.com/learn/serverless-functions)

## **Products**

* [Deno Runtime](https://deno.com/)  
* [Deno Deploy](https://deno.com/deploy)  
* [Deno KV](https://deno.com/kv)  
* [Deploy Subhosting](https://deno.com/deploy/subhosting)  
* [Fresh](https://fresh.deno.dev/)  
* [SaaSKit](https://deno.com/saaskit/)

## **Sources**

* [Runtime Manual](https://deno.com/manual)  
* [Runtime API](https://docs.deno.com/api/deno/)  
* [Deploy Docs](https://deno.com/deploy/docs)  
* [Standard Library](https://deno.com/std)  
* [Third-Party Modules](https://deno.com/x)  
* [Examples](https://examples.deno.land/)

## **Company**

* [Careers](https://deno.com/jobs)  
* [Blog](https://deno.com/blog)  
* [Pricing](https://deno.com/deploy/pricing)  
* [News](https://deno.news/)  
* [Merch](https://merch.deno.com/)  
* [Privacy Policy](https://docs.deno.com/deploy/manual/privacy-policy)

[GitHub](https://github.com/denoland)  
[Discord](https://discord.gg/deno)  
[Twitter or X or whatever](https://twitter.com/deno_land)  
[YouTube](https://youtube.com/@deno_land)  
[Mastodon](https://fosstodon.org/@deno_land)  
Copyright © 2024 Deno Land Inc. All rights reserved.  
[**All systems operational**](https://denostatus.com/)  

