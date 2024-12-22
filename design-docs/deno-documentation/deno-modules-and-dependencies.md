[docs.deno.com /runtime/fundamentals/modules/](https://docs.deno.com/runtime/fundamentals/modules/)

# **Modules and dependencies**

14-17 minutes

---

Deno uses [ECMAScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) as its default module system to align with modern JavaScript standards and to promote a more efficient and consistent development experience. It's the official standard for JavaScript modules, allows for better tree-shaking, improved tooling integration, and native support across different environments.

By adopting ECMAScript modules, Deno ensures compatibility with the ever-evolving JavaScript ecosystem. For developers, this means a streamlined and predictable module system that avoids the complexities associated with legacy module formats like CommonJS.

## **Importing modules Jump to heading**

In this example the `add` function is imported from a local `calc.ts` module.

calc.ts

export function add(a: number, b: number): number {  
  return a \+ b;  
}

main.ts

// imports the \`calc.ts\` module next to this file  
import { add } from "./calc.ts";

console.log(add(1, 2)); // 3

You can run this example by calling `deno run main.ts` in the directory that contains both `main.ts` and `calc.ts`.

With ECMAScript modules, local import specifiers must always include the full file extension. It cannot be omitted.

example.ts

// WRONG: missing file extension  
import { add } from "./calc";

// CORRECT: includes file extension  
import { add } from "./calc.ts";

## **Importing third party modules and libraries Jump to heading**

When working with third-party modules in Deno, use the same `import` syntax as you do for local code. Third party modules are typically imported from a remote registry and start with `jsr:` , `npm:` or `https://`.

main.ts

import { camelCase } from "jsr:@luca/cases@1.0.0";  
import { say } from "npm:cowsay@1.6.0";  
import { pascalCase } from "https://deno.land/x/case/mod.ts";

Deno recommends [JSR](https://jsr.io/), the modern JavaScript registry, for third party modules. There, you'll find plenty of well documented ES modules for your projects, including the [Deno Standard Library](https://docs.deno.com/runtime/fundamentals/standard_library/).

You can [read more about Deno's support for npm packages here](https://docs.deno.com/runtime/fundamentals/node/#using-npm-modules).

## **Managing third party modules and libraries Jump to heading**

Typing out the module name with the full version specifier can become tedious when importing them in multiple files. You can centralize management of remote modules with an `imports` field in your `deno.json` file. We call this `imports` field the **import map**, which is based on the [Import Maps Standard](https://github.com/WICG/import-maps).

deno.json

{  
  "imports": {  
    "@luca/cases": "jsr:@luca/cases@^1.0.0",  
    "cowsay": "npm:cowsay@^1.6.0",  
    "cases": "https://deno.land/x/case/mod.ts"  
  }  
}

With remapped specifiers, the code looks cleaner:

main.ts

import { camelCase } from "@luca/cases";  
import { say } from "cowsay";  
import { pascalCase } from "cases";

The remapped name can be any valid specifier. It's a very powerful feature in Deno that can remap anything. Learn more about what the import map can do [here](https://docs.deno.com/runtime/fundamentals/configuration/#dependencies).

## **Adding dependencies with `deno add` Jump to heading**

The installation process is made easy with the `deno add` subcommand. It will automatically add the latest version of the package you requested to the `imports` section in `deno.json`.

\# Add the latest version of the module to deno.json  
$ deno add jsr:@luca/cases  
Add @luca/cases \- jsr:@luca/cases@1.0.0

deno.json

{  
  "imports": {  
    "@luca/cases": "jsr:@luca/cases@^1.0.0"  
  }  
}

You can also specify an exact version:

\# Passing an exact version  
$ deno add jsr:@luca/cases@1.0.0  
Add @luca/cases \- jsr:@luca/cases@1.0.0

Read more in [`deno add` reference](https://docs.deno.com/runtime/reference/cli/add/).

You can also remove dependencies using `deno remove`:

$ deno remove @luca/cases  
Remove @luca/cases

deno.json

{  
  "imports": {}  
}

Read more in [`deno remove` reference](https://docs.deno.com/runtime/reference/cli/remove/).

## **Package Versions Jump to heading**

It is possible to specify a version range for the package you are importing. This is done using the `@` symbol followed by a version range specifier, and follows the [semver](https://semver.org/) versioning scheme.

For example:

@scopename/mypackage           \# highest version  
@scopename/mypackage@16.1.0    \# exact version  
@scopename/mypackage@16        \# highest 16.x version \>= 16.0.0  
@scopename/mypackage@^16.1.0   \# highest 16.x version \>= 16.1.0  
@scopename/mypackage@\~16.1.0   \# highest 16.1.x version \>= 16.1.0

Here is an overview of all the ways you can specify a version or a range:

| Symbol | Description | Example |
| ----- | ----- | ----- |
| `1.2.3` | An exact version. Only this specific version will be used. | `1.2.3` |
| `^1.2.3` | Compatible with version 1.2.3. Allows updates that do not change the leftmost non-zero digit. For example, `1.2.4` and `1.3.0` are allowed, but `2.0.0` is not. | `^1.2.3` |
| `~1.2.3` | Approximately equivalent to version 1.2.3. Allows updates to the patch version. For example, `1.2.4` is allowed, but `1.3.0` is not. | `~1.2.3` |
| `>=1.2.3` | Greater than or equal to version 1.2.3. Any version `1.2.3` or higher is allowed. | `>=1.2.3` |
| `<=1.2.3` | Less than or equal to version 1.2.3. Any version `1.2.3` or lower is allowed. | `<=1.2.3` |
| `>1.2.3` | Greater than version 1.2.3. Only versions higher than `1.2.3` are allowed. | `>1.2.3` |
| `<1.2.3` | Less than version 1.2.3. Only versions lower than `1.2.3` are allowed. | `<1.2.3` |
| `1.2.x` | Any patch version within the minor version 1.2. For example, `1.2.0`, `1.2.1`, etc. | `1.2.x` |
| `1.x` | Any minor and patch version within the major version 1\. For example, `1.0.0`, `1.1.0`, `1.2.0`, etc. | `1.x` |
| `*` | Any version is allowed. | `*` |

## **HTTPS imports Jump to heading**

Deno also supports import statements that reference HTTP/HTTPS URLs, either directly:

import { Application } from "https://deno.land/x/oak/mod.ts";

or part of your `deno.json` import map:

{  
  "imports": {  
    "oak": "https://deno.land/x/oak/mod.ts"  
  }  
}

Supporting HTTPS imports enables us to support the following JavaScript CDNs, as they provide URL access to JavaScript modules:

* [deno.land/x](https://deno.land/x)  
* [esm.sh](https://esm.sh/)  
* [unpkg.com](https://unpkg.com/)

HTTPS imports are useful if you have a small, often single file, Deno project that doesn't require any other configuration. With HTTPS imports, you can avoid having a `deno.json` file at all. It is **not** advised to use this style of import in larger applications however, as you may end up with version conflicts (where different files use different version specifiers).

Info

Use HTTPS imports with caution, and only **from trusted sources**. If the server is compromised, it could serve malicious code to your application. They can also cause versioning issues if you import different versions in different files. HTTPS imports remain supported, **but we recommend using a package registry for the best experience.**

### **Overriding HTTPS imports Jump to heading**

The other situation where import maps can be very useful is to override HTTPS imports in specific modules.

Let's say you want to override a `https://deno.land/x/my-library@1.0.0/mod.ts` specifier that is used inside files coming from `https://deno.land/x/example/` to a local patched version. You can do this by using a scope in the import map that looks something like this:

{  
  "imports": {  
    "example/": "https://deno.land/x/example/"  
  },  
  "scopes": {  
    "https://deno.land/x/example/": {  
      "https://deno.land/x/my-library@1.0.0/mod.ts": "./patched/mod.ts"  
    }  
  }  
}

Note

HTTPS imports have no notion of packages. Only the import map at the root of your project is used. Import maps used inside URL dependencies are ignored.

## **Publishing modules Jump to heading**

Any Deno program that defines an export can be published as a module. This allows other developers to import and use your code in their own projects. Modules can be published to:

* [JSR](https://jsr.io/) \- recommended, supports TypeScript natively and auto-generates documentation for you  
* [npm](https://www.npmjs.com/) \- use [dnt](https://github.com/denoland/dnt) to create the npm package  
* [deno.land/x](https://deno.com/add_module) \- for HTTPS imports, use JSR instead if possible

## **Reloading modules Jump to heading**

By default, Deno uses a global cache directory (`DENO_DIR`) for downloaded dependencies. This cache is shared across all projects.

You can force deno to refetch and recompile modules into the cache using the `--reload` flag.

\# Reload everything  
deno run \--reload my\_module.ts

\# Reload a specific module  
deno run \--reload=jsr:@std/fs my\_module.ts

## **Using only cached modules Jump to heading**

To force Deno to only use modules that have previously been cached, use the `--cached-only` flag:

deno run \--cached-only mod.ts

This will fail if there are any dependencies in the dependency tree for mod.ts which are not yet cached.

## **Vendoring remote modules Jump to heading**

If your project has external dependencies, you may want to store them locally to avoid downloading them from the internet every time you build your project. This is especially useful when building your project on a CI server or in a Docker container, or patching or otherwise modifying the remote dependencies.

Deno offers this functionality through a setting in your `deno.json` file:

{  
  "vendor": true  
}

Add the above snippet to your `deno.json` file and Deno will cache all dependencies locally in a `vendor` directory when the project is run, or you can optionally run the `deno install --entrypoint` command to cache the dependencies immediately:

deno install \--entrypoint main.ts

You can then run the application as usual with `deno run`:

deno run main.ts

After vendoring, you can run `main.ts` without internet access by using the `--cached-only` flag, which forces Deno to use only locally available modules.

## **Integrity Checking and Lock Files Jump to heading**

Imagine your module relies on a remote module located at [https://some.url/a.ts](https://some.url/a.ts). When you compile your module for the first time, `a.ts` is fetched, compiled, and cached. This cached version will be used until you either run your module on a different machine (such as in a production environment) or manually reload the cache (using a command like `deno install --reload`).

But what if the content at `https://some.url/a.ts` changes? This could result in your production module running with different dependency code than your local module. To detect this, Deno uses integrity checking and lock files.

Deno uses a `deno.lock` file to check external module integrity. To opt into a lock file, either:

1. Create a `deno.json` file in the current or an ancestor directory, which will automatically create an additive lockfile at `deno.lock`.  
   Note that this can be disabled by specifying the following in your deno.json:  
   deno.json

{  
  "lock": false  
}

2.   
3. Use the `--lock` flag to enable and specify lock file checking.

### **Frozen lockfile Jump to heading**

By default, Deno uses an additive lockfile, where new dependencies are added to the lockfile instead of erroring.

This might not be desired in certain scenarios (ex. CI pipelines or production environments) where you'd rather have Deno error when it encounters a dependency it's never seen before. To enable this, you can specify the `--frozen` flag or set the following in a deno.json file:

deno.json

{  
  "lock": {  
    "frozen": true  
  }  
}

When running a deno command with a frozen lockfile, any attempts to update the lockfile with new contents will cause the command to exit with an error showing the modifications that would have been made.

If you wish to update the lockfile, specify `--frozen=false` on the command line to temporarily disable the frozen lockfile.

### **Changing lockfile path Jump to heading**

The lockfile path can be configured by specifying `--lock=deps.lock` or the following in a Deno configuration file:

deno.json

{  
  "lock": {  
    "path": "deps.lock"  
  }  
}

## **Private repositories Jump to heading**

Note

If you're looking for private npm registries and `.npmrc` support, visit the [npm support](https://docs.deno.com/runtime/fundamentals/node/#private-registries) page.

There may be instances where you want to load a remote module that is located in a *private* repository, like a private repository on GitHub.

Deno supports sending bearer tokens when requesting a remote module. Bearer tokens are the predominant type of access token used with OAuth 2.0, and are broadly supported by hosting services (e.g., GitHub, GitLab, Bitbucket, Cloudsmith, etc.).

### **DENO\_AUTH\_TOKENS Jump to heading**

The Deno CLI will look for an environment variable named `DENO_AUTH_TOKENS` to determine what authentication tokens it should consider using when requesting remote modules. The value of the environment variable is in the format of *n* number of tokens delimited by a semi-colon (`;`) where each token is either:

* a bearer token in the format of `{token}@{hostname[:port]}` or  
* basic auth data in the format of `{username}:{password}@{hostname[:port]}`

For example, a single token for `deno.land` would look something like this:

DENO\_AUTH\_TOKENS=a1b2c3d4e5f6@deno.land

or:

DENO\_AUTH\_TOKENS=username:password@deno.land

And multiple tokens would look like this:

DENO\_AUTH\_TOKENS=a1b2c3d4e5f6@deno.land;f1e2d3c4b5a6@example.com:8080;username:password@deno.land

When Deno goes to fetch a remote module, where the hostname matches the hostname of the remote module, Deno will set the `Authorization` header of the request to the value of `Bearer {token}` or `Basic {base64EncodedData}`. This allows the remote server to recognize that the request is an authorized request tied to a specific authenticated user, and provide access to the appropriate resources and modules on the server.

### **GitHub Jump to heading**

To access private repositories on GitHub, you would need to issue yourself a *personal access token*. You do this by logging into GitHub and going under *Settings \-\> Developer settings \-\> Personal access tokens*:

![Personal access tokens settings on GitHub][image1]

You would then choose to *Generate new token* and give your token a description and appropriate access to the `repo` scope. The `repo` scope will enable reading file contents (more on [scopes in the GitHub docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes)):

![Creating a new personal access token on GitHub][image2]

And once created GitHub will display the new token a single time, the value of which you would want to use in the environment variable:

![Display of newly created token on GitHub][image3]

In order to access modules that are contained in a private repository on GitHub, you would want to use the generated token in the `DENO_AUTH_TOKENS` environment variable scoped to the `raw.githubusercontent.com` hostname. For example:

DENO\_AUTH\_TOKENS=a1b2c3d4e5f6@raw.githubusercontent.com

This should allow Deno to access any modules that the user who the token was issued for has access to.

When the token is incorrect, or the user does not have access to the module, GitHub will issue a `404 Not Found` status, instead of an unauthorized status. So if you are getting errors that the modules you are trying to access are not found on the command line, check the environment variable settings and the personal access token settings.

In addition, `deno run -L debug` should print out a debug message about the number of tokens that are parsed out of the environment variable. It will print an error message if it feels any of the tokens are malformed. It won't print any details about the tokens for security purposes.

---

Previous Chapter[Next Chapter](https://docs.deno.com/runtime/fundamentals/configuration/)  
[docs.deno.com /runtime/fundamentals/node/](https://docs.deno.com/runtime/fundamentals/node/)

# **Node and npm support**

20-26 minutes

---

Modern Node.js projects will run in Deno with little to no reworking required. However, there are some key differences between the two runtimes that you can take advantage of to make your code simpler and smaller when migrating your Node.js projects to Deno.

[Explore built-in Node APIs](https://docs.deno.com/api/node/)

## **Using Node's built-in modules Jump to heading**

Deno provides a compatibility layer that allows the use of Node.js built-in APIs within Deno programs. However, in order to use them, you will need to add the `node:` specifier to any import statements that use them:

import \* as os from "node:os";  
console.log(os.cpus());

And run it with `deno run main.mjs` \- you will notice you get the same output as running the program in Node.js.

Updating any imports in your application to use `node:` specifiers should enable any code using Node built-ins to function as it did in Node.js.

To make updating existing code easier, Deno will provide helpful hints for imports that don't use `node:` prefix:

main.mjs

import \* as os from "os";  
console.log(os.cpus());

$ deno run main.mjs  
error: Relative import path "os" not prefixed with / or ./ or ../  
  hint: If you want to use a built-in Node module, add a "node:" prefix (ex. "node:os").  
    at file:///main.mjs:1:21

The same hints and additional quick-fixes are provided by the Deno LSP in your editor.

## **Using npm packages Jump to heading**

Deno has native support for importing npm packages by using `npm:` specifiers. For example:

main.js

import \* as emoji from "npm:node-emoji";

console.log(emoji.emojify(\`:sauropod: :heart:  npm\`));

Can be run with:

$ deno run main.js  
🦕 ❤️ npm

No `npm install` is necessary before the `deno run` command and no `node_modules` folder is created. These packages are also subject to the same [permissions](https://docs.deno.com/runtime/fundamentals/security/) as other code in Deno.

npm specifiers have the following format:

npm:\[@\]\[/\]

For examples with popular libraries, please refer to the [tutorial section](https://docs.deno.com/runtime/tutorials).

## **CommonJS support Jump to heading**

CommonJS is a module system that predates [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). While we firmly believe that ES modules are the future of JavaScript, there are millions of npm libraries that are written in CommonJS and Deno offers full support for them. Deno will automatically determine if a package is using CommonJS and make it work seamlessly when imported:

main.js

import react from "npm:react";  
console.log(react);

$ deno run \-E main.js  
18.3.1

*`npm:react` is a CommonJS package. Deno allows you to import it as if it were an ES module.*

Deno strongly encourages the use of ES modules in your code but offers CommonJS support with following restrictions:

**Deno's permission system is still in effect when using CommonJS modules.** It may be necessary to provide at least `--allow-read` permission as Deno will probe the file system for `package.json` files and `node_modules` directory to properly resolve CommonJS modules.

### **Use .cjs extension Jump to heading**

If the file extension is `.cjs` Deno will treat this module as CommonJS.

main.cjs

const express \= require("express");

Deno does not look for `package.json` files and `type` option to determine if the file is CommonJS or ESM.

When using CommonJS, Deno expects that dependencies will be installed manually and a `node_modules` directory will be present. It's best to set `"nodeModulesDir": "auto"` in your `deno.json` to ensure that.

$ cat deno.json  
{  
  "nodeModulesDir": "auto"  
}

$ deno install npm:express  
Add npm:express@5.0.0

$ deno run \-R \-E main.cjs  
\[Function: createApplication\] {  
  application: {  
    init: \[Function: init\],  
    defaultConfiguration: \[Function: defaultConfiguration\],  
    ...  
  }  
}

`-R` and `-E` flags are used to allow permissions to read files and environment variables.

### **package.json type option Jump to heading**

Deno will attempt to load `.js`, `.jsx`, `.ts`, and `.tsx` files as CommonJS if there's a `package.json` file with `"type": "commonjs"` option next to the file, or up in the directory tree when in a project with a package.json file.

package.json

{  
  "type": "commonjs"  
}

main.js

const express \= require("express");

Tools like Next.js's bundler and others will generate a `package.json` file like that automatically.

If you have an existing project that uses CommonJS modules, you can make it work with both Node.js and Deno, by adding `"type": "commonjs"` option to the `package.json` file.

### **Always detecting if a file might be CommonJS Jump to heading**

Telling Deno to analyze modules as possibly being CommonJS is possible by running with the `--unstable-detect-cjs` in Deno \>= 2.1.2. This will take effect, except when there's a *package.json* file with `{ "type": "module" }`.

Looking for package.json files on the file system and analyzing a module to detect if its CommonJS takes longer than not doing it. For this reason and to discourage the use of CommonJS, Deno does not do this behavior by default.

### **Create require() manually Jump to heading**

An alternative option is to create an instance of the `require()` function manually:

main.js

import { createRequire } from "node:module";  
const require \= createRequire(import.meta.url);  
const express \= require("express");

In this scenario the same requirements apply, as when running `.cjs` files \- dependencies need to be installed manually and appropriate permission flags given.

### **require(ESM) Jump to heading**

Deno's `require()` implementation supports requiring ES modules.

This works the same as in Node.js, where you can only `require()` ES modules that don't have Top-Level Await in their module graph \- or in other words you can only `require()` ES modules that are "synchronous".

greet.js

export function greet(name) {  
  return \`Hello ${name}\`;  
}

esm.js

import { greet } from "./greet.js";

export { greet };

main.cjs

const esm \= require("./esm");  
console.log(esm);  
console.log(esm.greet("Deno"));

$ deno run \-R main.cjs  
\[Module: null prototype\] { greet: \[Function: greet\] }  
Hello Deno

### **Import CommonJS modules Jump to heading**

You can also import CommonJS files in ES modules.

greet.cjs

module.exports \= {  
  hello: "world",  
};

main.js

import greet from "./greet.js";  
console.log(greet);

$ deno run main.js  
{  
  "hello": "world"  
}

**Hints and suggestions**

Deno will provide useful hints and suggestions to guide you towards working code when working with CommonJS modules.

As an example, if you try to run a CommonJS module that doesn't have `.cjs` extension or doesn't have a `package.json` with `{ "type": "commonjs" }` you might see this:

main.js

module.exports \= {  
  hello: "world",  
};

$ deno run main.js  
error: Uncaught (in promise) ReferenceError: module is not defined  
module.exports \= {  
^  
    at file:///main.js:1:1

    info: Deno supports CommonJS modules in .cjs files, or when the closest  
          package.json has a "type": "commonjs" option.  
    hint: Rewrite this module to ESM,  
          or change the file extension to .cjs,  
          or add package.json next to the file with "type": "commonjs" option,  
          or pass \--unstable-detect-cjs flag to detect CommonJS when loading.  
    docs: https://docs.deno.com/go/commonjs

## **Importing types Jump to heading**

Many npm packages ship with types, you can import these and use them with types directly:

import chalk from "npm:chalk@5";

Some packages do not ship with types but you can specify their types with the [`@ts-types`](https://docs.deno.com/runtime/fundamentals/typescript) directive. For example, using a [`@types`](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html#definitelytyped--types) package:

// @ts-types="npm:@types/express@^4.17"  
import express from "npm:express@^4.17";

**Module resolution**

The official TypeScript compiler `tsc` supports different [moduleResolution](https://www.typescriptlang.org/tsconfig#moduleResolution) settings. Deno only supports the modern `node16` resolution. Unfortunately many npm packages fail to correctly provide types under node16 module resolution, which can result in `deno check` reporting type errors, that `tsc` does not report.

If a default export from an `npm:` import appears to have a wrong type (with the right type seemingly being available under the `.default` property), it's most likely that the package provides wrong types under node16 module resolution for imports from ESM. You can verify this by checking if the error also occurs with `tsc --module node16` and `"type": "module"` in `package.json` or by consulting the [Are the types wrong?](https://arethetypeswrong.github.io/) website (particularly the "node16 from ESM" row).

If you want to use a package that doesn't support TypeScript's node16 module resolution, you can:

1. Open an issue at the issue tracker of the package about the problem. (And perhaps contribute a fix 😃 (Although, unfortunately, there is a lack of tooling for packages to support both ESM and CJS, since default exports require different syntaxes. See also [microsoft/TypeScript\#54593](https://github.com/microsoft/TypeScript/issues/54593))  
2. Use a [CDN](https://docs.deno.com/runtime/fundamentals/modules/#url_imports), that rebuilds the packages for Deno support, instead of an `npm:` identifier.  
3. Ignore the type errors you get in your code base with `// @ts-expect-error` or `// @ts-ignore`.

## **Including Node types Jump to heading**

Node ships with many built-in types like `Buffer` that might be referenced in an npm package's types. To load these you must add a types reference directive to the `@types/node` package:

/// \<reference types="npm:@types/node" /\>

Note that it is fine to not specify a version for this in most cases because Deno will try to keep it in sync with its internal Node code, but you can always override the version used if necessary.

## **Executable npm scripts Jump to heading**

npm packages with `bin` entries can be executed from the command line without an `npm install` using a specifier in the following format:

npm:\[@\]\[/\]

For example:

$ deno run \--allow-read npm:cowsay@1.5.0 "Hello there\!"  
 \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
\< Hello there\! \>  
 \--------------  
        \\   ^\_\_^  
         \\  (oo)\\\_\_\_\_\_\_\_  
            (\_\_)\\       )\\/\\  
                ||----w |  
                ||     ||

$ deno run \--allow-read npm:cowsay@1.5.0/cowthink "What to eat?"  
 \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
( What to eat? )  
 \--------------  
        o   ^\_\_^  
         o  (oo)\\\_\_\_\_\_\_\_  
            (\_\_)\\       )\\/\\  
                ||----w |  
                ||     ||

## **node\_modules Jump to heading**

When you run `npm install`, npm creates a `node_modules` directory in your project which houses the dependencies as specified in the `package.json` file.

Deno uses [npm specifiers](https://docs.deno.com/runtime/fundamentals/node/#using-npm-packages) to resolve npm packages to a central global npm cache, instead of using a `node_modules` folder in your projects. This is ideal since it uses less space and keeps your project directory clean.

There may however be cases where you need a local `node_modules` directory in your Deno project, even if you don’t have a `package.json` (eg. when using frameworks like Next.js or Svelte or when depending on npm packages that use Node-API).

#### **Default Deno dependencies behavior Jump to heading**

By default, Deno will not create a `node_modules` directory when you use the `deno run` command, dependencies will be installed into the global cache. This is the recommended setup for new Deno projects.

#### **Automatic node\_modules creation Jump to heading**

If you need a `node_modules` directory in your project, you can use the `--node-modules-dir` flag or `nodeModulesDir: auto` option in the config file to tell Deno to create a `node_modules` directory in the current working directory:

deno run \--node-modules-dir=auto main.ts

or with a configuration file:

deno.json

{  
  "nodeModulesDir": "auto"  
}

The auto mode automatically installs dependencies into the global cache and creates a local node\_modules directory in the project root. This is recommended for projects that have npm dependencies that rely on node\_modules directory \- mostly projects using bundlers or ones that have npm dependencies with postinstall scripts.

#### **Manual node\_modules creation Jump to heading**

If your project has a `package.json` file, you can use the manual mode, which requires an installation step to create your `node_modules` directory:

deno install  
deno run \--node-modules-dir=manual main.ts

or with a configuration file:

deno.json

{ "nodeModulesDir": "manual" }

You would then run `deno install/npm install/pnpm install` or any other package manager to create the `node_modules` directory.

Manual mode is the default mode for projects using a `package.json`. You may recognize this workflow from Node.js projects. It is recommended for projects using frameworks like Next.js, Remix, Svelte, Qwik etc, or tools like Vite, Parcel or Rollup.

Note

We recommend that you use the default `none` mode, and fallback to `auto` or `manual` mode if you get errors about missing packages inside the `node_modules` directory.

#### **node\_modules with Deno 1.X Jump to heading**

Use the `--node-modules-dir` flag.

For example, given `main.ts`:

import chalk from "npm:chalk@5";

console.log(chalk.green("Hello"));

deno run \--node-modules-dir main.ts

Running the above command, with a `--node-modules-dir` flag, will create a `node_modules` folder in the current directory with a similar folder structure to npm.

## **Node.js global objects Jump to heading**

In Node.js, there are a number of [global objects](https://nodejs.org/api/globals.html) available in the scope of all programs that are specific to Node.js, eg. `process` object.

Here are a few globals that you might encounter in the wild and how to use them in Deno:

* `process` \- Deno provides the `process` global, which is by far the most popular global used in popular npm packages. It is available to all code. However, Deno will guide you towards importing it explicitly from `node:process` module by providing lint warnings and quick-fixes:

process.js

console.log(process.versions.deno);

$ deno run process.js  
2.0.0  
$ deno lint process.js  
error\[no-process-globals\]: NodeJS process global is discouraged in Deno  
 \--\> /process.js:1:13  
  |  
1 | console.log(process.versions.deno);  
  |             ^^^^^^^  
  \= hint: Add \`import process from "node:process";\`

  docs: https://lint.deno.land/rules/no-process-globals

Found 1 problem (1 fixable via \--fix)  
Checked 1 file

* `require()` \- see CommonJS support  
* `Buffer` \- to use `Buffer` API it needs to be explicitly imported from the `node:buffer` module:

buffer.js

import { Buffer } from "node:buffer";

const buf \= new Buffer(5, "0");

Prefer using [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) or other [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) subclasses instead.

* `__filename` \- use `import.meta.filename` instead.  
* `__dirname` \- use `import.meta.dirname` instead.

## **Node-API addons Jump to heading**

Deno supports [Node-API addons](https://nodejs.org/api/n-api.html) that are used by popular npm packages like [`esbuild`](https://www.npmjs.com/package/esbuild), [`npm:sqlite3`](https://www.npmjs.com/package/sqlite3) or [`npm:duckdb`](https://www.npmjs.com/package/duckdb).

You can expect all packages that use public and documented Node-APIs to work.

Info

Most packages using Node-API addons rely on npm "lifecycle scripts", like `postinstall`.

While Deno supports them, they are not run by default due to security considerations. Read more in [`deno install` docs](https://docs.deno.com/runtime/reference/cli/install/).

As of Deno 2.0, npm packages using Node-API addons **are only supported when a `node_modules/` directory is present**. Add `"nodeModulesDir": "auto"` or `"nodeModulesDir": "manual"` setting your `deno.json` file, or run with `--node-modules-dir=auto|manual` flag to ensure these packages work correctly. In case of misconfiguration Deno will provide hints how the situation can be resolved.

## **Migrating from Node to Deno Jump to heading**

Running your Node.js project with Deno is a straightforward process. In most cases you can expect little to no changes to be required, if your project is written using ES modules.

Main points to be aware of, include:

1. Importing Node.js built-in modules requires the `node:` specifier:

// ❌  
import \* as fs from "fs";  
import \* as http from "http";

// ✅  
import \* as fs from "node:fs";  
import \* as http from "node:http";

Tip

It is recommended to change these import specifiers in your existing project anyway. This is a recommended way to import them in Node.js too.

2. Some globals available in Node.js need to be explicitly imported, eg. `Buffer`:

import { Buffer } from "node:buffer";

3. `require()` is only available in files with `.cjs` extension, in other files an instance of `require()` needs to be created manually. npm dependencies can use `require()` regardless of file extension.

### **Running scripts Jump to heading**

Deno supports running npm scripts natively with the [`deno task`](https://docs.deno.com/runtime/reference/cli/task_runner/) subcommand (If you're migrating from Node.js, this is similar to the `npm run script` command). Consider the following Node.js project with a script called `start` inside its `package.json`:

package.json

{  
  "name": "my-project",  
  "scripts": {  
    "start": "eslint"  
  }  
}

You can execute this script with Deno by running:

deno task start

### **Optional improvements Jump to heading**

One of Deno's core strengths is a unified toolchain that comes with support for TypeScript out of the box, and tools like a linter, formatter and a test runner. Switching to Deno allows you to simplify your toolchain and reduces the number of moving components in your project.

**Configuration**

Deno has its own config file, `deno.json` or `deno.jsonc`, which can be used to [configure your project](https://docs.deno.com/runtime/fundamentals/configuration/)

You can use it to [define dependencies](https://docs.deno.com/runtime/fundamentals/configuration/) using the `imports` option \- you can migrate your dependencies one-by-one from `package.json`, or elect to not define them in the config file at all and use `npm:` specifiers inline in your code.

In addition to specifying dependencies you can use `deno.json` to define tasks, lint and format options, path mappings, and other runtime configurations.

**Linting**

Deno ships with a built-in linter that is written with performance in mind. It's similar to ESlint, though with a limited number of rules. If you don't rely on ESLint plugins, you can drop `eslint` dependency from `devDependencies` section of `package.json` and use `deno lint` instead.

Deno can lint large projects in just a few milliseconds. You can try it out on your project by running:

deno lint

This will lint all files in your project. When the linter detects a problem, it will show the line in your editor and in the terminal output. An example of what that might look like:

error\[no-constant-condition\]: Use of a constant expressions as conditions is not allowed.  
 \--\> /my-project/bar.ts:1:5  
  |   
1 | if (true) {  
  |     ^^^^  
  \= hint: Remove the constant expression

  docs: https://lint.deno.land/rules/no-constant-condition

Found 1 problem  
Checked 4 files

Many linting issues can be fixed automatically by passing the `--fix` flag:

deno lint \--fix

A full list of all supported linting rules can be found on [https://lint.deno.land/](https://lint.deno.land/). To learn more about how to configure the linter, check out the [`deno lint` subcommand](https://docs.deno.com/runtime/reference/cli/linter/).

**Formatting**

Deno ships with a [built-in formatter](https://docs.deno.com/runtime/reference/cli/formatter/) that can optionally format your code according to the Deno style guide. Instead of adding `prettier` to your `devDependencies` you can instead use Deno's built-in zero-config code formatter `deno fmt`.

You can run the formatter on your project by running:

deno fmt

If using `deno fmt` in CI, you can pass the `--check` argument to make the formatter exit with an error when it detects improperly formatted code.

deno fmt \--check

The formatting rules can be configured in your `deno.json` file. To learn more about how to configure the formatter, check out the [`deno fmt` subcommand](https://docs.deno.com/runtime/reference/cli/formatter/).

**Testing**

Deno encourages writing tests for your code, and provides a built-in test runner to make it easy to write and run tests. The test runner is tightly integrated into Deno, so that you don't have to do any additional configuration to make TypeScript or other features work.

my\_test.ts

Deno.test("my test", () \=\> {  
  // Your test code here  
});

deno test

When passing the `--watch` flag, the test runner will automatically reload when any of the imported modules change.

To learn more about the test runner and how to configure it, check out the [`deno test` subcommand](https://docs.deno.com/runtime/reference/cli/test/) documentation.

## **Private registries Jump to heading**

Deno supports private registries, which allow you to host and share your own modules. This is useful for organizations that want to keep their code private or for individuals who want to share their code with a select group of people.

### **What are private registries? Jump to heading**

Large organizations often host their own private npm registries to manage internal packages securely. These private registries serve as repositories where organizations can publish and store their proprietary or custom packages. Unlike public npm registries, private registries are accessible only to authorized users within the organization.

### **How to use private registries with Deno Jump to heading**

First, configure your [`.npmrc`](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc) file to point to your private registry. The `.npmrc` file must be in the project root or `$HOME` directory. Add the following to your `.npmrc` file:

@mycompany:registry=http://mycompany.com:8111/  
//mycompany.com:8111/:\_auth=secretToken

Replace `http://mycompany.com:8111/` with the actual URL of your private registry and `secretToken` with your authentication token.

Then update Your `deno.json` or `package.json` to specify the import path for your private package. For example:

deno.json

{  
  "imports": {  
    "@mycompany/package": "npm:@mycompany/package@1.0.0"  
  }  
}

or if you're using a `package.json`:

package.json

{  
  "dependencies": {  
    "@mycompany/package": "1.0.0"  
  }  
}

Now you can import your private package in your Deno code:

main.ts

import { hello } from "@mycompany/package";

console.log(hello());

and run it using the `deno run` command:

deno run main.ts

## **Node to Deno Cheatsheet Jump to heading**

| Node.js | Deno |
| ----- | ----- |
| `node file.js` | `deno file.js` |
| `ts-node file.ts` | `deno file.ts` |
| `nodemon` | `deno run --watch` |
| `node -e` | `deno eval` |
| `npm i` / `npm install` | `deno install` |
| `npm install -g` | `deno install -g` |
| `npm run` | `deno task` |
| `eslint` | `deno lint` |
| `prettier` | `deno fmt` |
| `package.json` | `deno.json` or `package.json` |
| `tsc` | `deno check` ¹ |
| `typedoc` | `deno doc` |
| `jest` / `ava` / `mocha` / `tap` / etc | `deno test` |
| `nexe` / `pkg` | `deno compile` |
| `npm explain` | `deno info` |
| `nvm` / `n` / `fnm` | `deno upgrade` |
| `tsserver` | `deno lsp` |
| `nyc` / `c8` / `istanbul` | `deno coverage` |
| benchmarks | `deno bench` |

¹ Type checking happens automatically, TypeScript compiler is built into the `deno` binary.

---

Previous Chapter[Next Chapter](https://docs.deno.com/runtime/fundamentals/security/)  
