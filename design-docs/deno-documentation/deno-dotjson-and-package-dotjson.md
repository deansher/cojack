docs.deno.com /runtime/fundamentals/configuration/
deno.json and package.json
11-14 minutes
You can configure Deno using a deno.json file. This file can be used to configure the TypeScript compiler, linter, formatter, and other Deno tools.

The configuration file supports .json and .jsonc extensions.

Deno will automatically detect a deno.json or deno.jsonc configuration file if it's in your current working directory or parent directories. The --config flag can be used to specify a different configuration file.

package.json support Jump to heading
Deno also supports a package.json file for compatibility with Node.js projects. If you have a Node.js project, it is not necessary to create a deno.json file. Deno will use the package.json file to configure the project.

If both a deno.json and package.json file are present in the same directory, Deno will understand dependencies specified in both deno.json and package.json; and use the deno.json file for Deno-specific configurations. Read more about Node compatibility in Deno.

Dependencies Jump to heading
The "imports" field in your deno.json allows you to specify dependencies used in your project. You can use it to map bare specifiers to URLs or file paths making it easier to manage dependencies and module resolution in your applications.

For example, if you want to use the assert module from the standard library in your project, you could use this import map:

deno.json

{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0",
    "chalk": "npm:chalk@5"
  }
}
Then your script can use the bare specifier std/assert:

script.ts

import { assertEquals } from "@std/assert";
import chalk from "chalk";

assertEquals(1, 2);
console.log(chalk.yellow("Hello world"));
You can also use a "dependencies" field in package.json:

package.json

{
  "dependencies": {
    "express": "express@^1.0.0"
  }
}
script.ts

import express from "express";

const app = express();
Note that this will require you to run deno install.

Read more about module imports and dependencies

Custom path mappings Jump to heading
The import map in deno.json can be used for more general path mapping of specifiers. You can map an exact specifiers to a third party module or a file directly, or you can map a part of an import specifier to a directory.

deno.jsonc

{
  "imports": {
    // Map to an exact file
    "foo": "./some/long/path/foo.ts",
    // Map to a directory, usage: "bar/file.ts"
    "bar/": "./some/folder/bar/"
  }
}
Usage:

import * as foo from "foo";
import * as bar from "bar/file.ts";
Path mapping of import specifies is commonly used in larger code bases for brevity.

To use your project root for absolute imports:

deno.json

{
  "imports": {
    "/": "./",
    "./": "./"
  }
}
main.ts

import { MyUtil } from "/util.ts";
This causes import specifiers starting with / to be resolved relative to the import map's URL or file path.

Tasks Jump to heading
The tasks field in your deno.json file is used to define custom commands that can be executed with the deno task command and allows you to tailor commands and permissions to the specific needs of your project.

It is similar to the scripts field in a package.json file, which is also supported.

deno.json

{
  "tasks": {
    "start": "deno run --allow-net --watch=static/,routes/,data/ dev.ts",
    "test": "deno test --allow-net",
    "lint": "deno lint"
  }
}
package.json

{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}
To execute a task, use the deno task command followed by the task name. For example:

deno task start
deno task test
deno task lint
deno task dev
deno task build
Read more about deno task.

Linting Jump to heading
The lint field in the deno.json file is used to configure the behavior of Deno’s built-in linter. This allows you to specify which files to include or exclude from linting, as well as customize the linting rules to suit your project’s needs.

For example:

deno.json

{
  "lint": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"],
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    }
  }
}
This configuration will:

only lint files in the src/ directory,
will not lint files in the src/testdata/ directory or any TypeScript files in the src/fixtures/ directory.
specifies that the recommended linting rules should be applied,
adds the ban-untagged-todo
removes the no-unused-vars rule excluded.
You can find a full list of available linting rules in the Deno lint documentation.

Read more about linting with Deno.

Formatting Jump to heading
The fmt field in the deno.json file is used to configure the behavior of Deno’s built-in code formatter. This allows you to customize how your code is formatted, ensuring consistency across your project, making it easier to read and collaborate on. Here are the key options you can configure:

deno.json

{
  "fmt": {
    "useTabs": true,
    "lineWidth": 80,
    "indentWidth": 4,
    "semiColons": true,
    "singleQuote": true,
    "proseWrap": "preserve",
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  }
}
This configuration will:

use tabs instead of spaces for indentation,
limit lines to 80 characters,
use an indentation width of 4 spaces,
add semicolons to the end of statements,
use single quotes for strings,
preserve prose wrapping,
format files in the src/ directory,
exclude files in the src/testdata/ directory and any TypeScript files in the src/fixtures/ directory.
Read more about formatting your code with Deno.

Lockfile Jump to heading
The lock field in the deno.json file is used to specify configuration of the lock file that Deno uses to ensure the integrity of your dependencies. A lock file records the exact versions and integrity hashes of the modules your project depends on, ensuring that the same versions are used every time the project is run, even if the dependencies are updated or changed remotely.

deno.json

{
  "lock": {
    "path": "./deno.lock",
    "frozen": true
  }
}
This configuration will:

specify lockfile location at ./deno.lock (this is the default and can be omitted)
tell Deno that you want to error out if any dependency changes
Deno uses lockfile by default, you can disable it with following configuration:

deno.json

{
  "lock": false
}
Node modules directory Jump to heading
By default Deno uses a local node_modules directory if you have a package.json file in your project directory.

You can control this behavior using the nodeModulesDir field in the deno.json file.

deno.json

{
  "nodeModulesDir": "auto"
}
You can set this field to following values:

Value	Behavior
"none"	Don't use a local node_modules directory. Instead use global cache in $DENO_DIR that is automatically kept up to date by Deno.
"auto"	Use a local node_modules directory. The directory is automatically created and kept up to date by Deno.
"manual"	Use a local node_modules directory. User must keep this directory up to date manually, eg. using deno install or npm install.
It is not required to specify this setting, the following defaults are applied:

"none" if there is no package.json file in your project directory
"manual" if there is a package.json file in your project directory
When using workspaces, this setting can only be used in the workspace root. Specifying it in any of the members will result in warnings. The "manual" setting will only be applied automatically if there's a package.json file in the workspace root.

TypeScript compiler options Jump to heading
The compilerOptions field in the deno.json file is used to configure TypeScript compiler settings for your Deno project. This allows you to customize how TypeScript code is compiled, ensuring it aligns with your project’s requirements and coding standards.

Info

Deno recommends the default TypeScript configuration. This will help when sharing code.

See also Configuring TypeScript in Deno.

Unstable features Jump to heading
The unstable field in a deno.json file is used to enable specific unstable features for your Deno project.

These features are still in development and not yet part of the stable API. By listing features in the unstable array, you can experiment with and use these new capabilities before they are officially released.

deno.json

{
  "unstable": ["cron", "kv", "webgpu"]
}
Learn more.

include and exclude Jump to heading
Many configurations (ex. lint, fmt) have an include and exclude property for specifying the files to include.

include Jump to heading
Only the paths or patterns specified here will be included.

{
  "lint": {
    // only format the src/ directory
    "include": ["src/"]
  }
}
exclude Jump to heading
The paths or patterns specified here will be excluded.

{
  "lint": {
    // don't lint the dist/ folder
    "exclude": ["dist/"]
  }
}
This has HIGHER precedence than include and will win over include if a path is matched in both include and exclude.

You may wish to exclude a directory, but include a sub directory. In Deno 1.41.2+, you may un-exclude a more specific path by specifying a negated glob below the more general exclude:

{
  "fmt": {
    // don't format the "fixtures" directory,
    // but do format "fixtures/scripts"
    "exclude": [
      "fixtures",
      "!fixtures/scripts"
    ]
  }
}
Top level exclude Jump to heading
If there's a directory you never want Deno to fmt, lint, type check, analyze in the LSP, etc., then specify it in the top level exclude array:

{
  "exclude": [
    // exclude the dist folder from all sub-commands and the LSP
    "dist/"
  ]
}
Sometimes you may find that you want to un-exclude a path or pattern that's excluded in the top level-exclude. In Deno 1.41.2+, you may un-exclude a path by specifying a negated glob in a more specific config:

{
  "fmt": {
    "exclude": [
      // format the dist folder even though it's
      // excluded at the top level
      "!dist"
    ]
  },
  "exclude": [
    "dist/"
  ]
}
Publish - Override .gitignore Jump to heading
The .gitignore is taken into account for the deno publish command. In Deno 1.41.2+, you can opt-out of excluded files ignored in the .gitignore by using a negated exclude glob:

.gitignore

dist/
.env
deno.json

{
  "publish": {
    "exclude": [
      // include the .gitignored dist folder
      "!dist/"
    ]
  }
}
Alternatively, explicitly specifying the gitignored paths in an "include" works as well:

{
  "publish": {
    "include": [
      "dist/",
      "README.md",
      "deno.json"
    ]
  }
}
Full example Jump to heading
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true
  },
  "lint": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"],
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    }
  },
  "fmt": {
    "useTabs": true,
    "lineWidth": 80,
    "indentWidth": 4,
    "semiColons": false,
    "singleQuote": true,
    "proseWrap": "preserve",
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  },
  "lock": false,
  "nodeModulesDir": "auto",
  "unstable": ["webgpu"],
  "test": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  },
  "tasks": {
    "start": "deno run --allow-read main.ts"
  },
  "imports": {
    "oak": "jsr:@oak/oak"
  },
  "exclude": [
    "dist/"
  ]
}
JSON schema Jump to heading
A JSON schema file is available for editors to provide autocompletion. The file is versioned and available at: https://deno.land/x/deno/cli/schemas/config-file.v1.json

Proxies Jump to heading
Deno supports proxies for module downloads and the fetch API. Proxy configuration is read from environment variables: HTTP_PROXY, HTTPS_PROXY and NO_PROXY.

If you are using Windows - if environment variables are not found Deno falls back to reading proxies from the registry.

Previous Chapter
Next Chapter