# Change Log

## Template7 v1.3.6 - Released on June 11, 2018
  * Better `@global` parsing in `js` and `js_if` helpers

## Template7 v1.3.5 - Released on January 22, 2018
  * Fixed helpers access when used as ES module
  * Added support for dynamic helper names and partials by encapsulating their names in `[]` square brackets

## Template7 v1.3.1 - Released on October 25, 2017
  * Added new `{{#raw}}...{{/raw}}` block helper to bypass template compilation inside of this block
  * Less strict rules for spaces inside of expressions. Expressions like `{{ name }}` works now as expected
  * ES-module package renamed from `template7.module.js` to `template7.esm.js`

## Template7 v1.3.0 - Released on September 13, 2017
  * Small performance improvements with decreased number of `eval` calls
  * Source-code restructure into more ES-next modules

## Template7 v1.2.5 - Released on August 2, 2017
  * `js_compare` helper has been renamed to `js_if` helper. `js_compare` is still available for backwards compatibility
  * Added support for `@index`, `@first`, `@last`, `@key`, `@root`, `@global` variables to `js` and `js_if` helpers
  * Added support for parent access (e.g. `../title`)  to `js` and `js_if` helpers
  * Added support for parent data access within loops, e.g. `../../@index`

## Template7 v1.2.3 - Released on May 12, 2017
  * Fixed ES2015 module build to have ES 2015 syntax

## Template7 v1.2.1 - Released on April 19, 2017
  * Added ES2015 module build

## Template7 v1.2.0 - Released on April 15, 2017
  * Added support for node.js and commonjs

## Template7 v1.1.4 - Released on December 12, 2016
  * Fixed issue with quotes being added to helpers hash content

## Template7 v1.1.2 - Released on September 1, 2016
  * Added number, boolean, and single-quote-strings argument types support for template helpers #19
  * Ability to use single/double quotes in helpers and mix them

## Template7 v1.1.0 - Released on October 3, 2015
  * Access to data (@index, @key) and root context (@root) in partials

## Template7 v1.0.7 - Released on September 28, 2015
  * Added check is variable is `null` and don't output it in this case

## Template7 v1.0.6 - Released on June 20, 2015
  * Partials support:
    * `registerPartial(name, template)` method to register partial
    * `unregisterPartial(name, template)` method to unregister partial
    * `>` helper to include partials like `{{> list}}`
  * New `escape` helper for escaping strings

## Template7 v1.0.5 - Released on March 28, 2015
    * Support for root context that may be used in templates as `{{@root.someVar}}`
    * Improved support for paths:
        * Support to access arrays directly by index `{{someArray.2}}`
        * Better support for context "level up" `{{../../../someVar}}`
    * New JS helpers with direct JS execution:
        * `{{js "this.price * 2"}} - inline helper to modify context on the fly
        * `{{#js_compare "this.price > 1000"}}Too expensive{{/js_compare}} - block helper for easier compares of variables

## Template7 v1.0.2 - Released on November 27, 2014
    * Support for global context `Template7.global` that may be used in templates as `{{@global.someVar}}`

## Template7 v1.0.1 - Released on October 7, 2014
    * Allow helpers without context
    * New `.unregisterHelper` method to remove registered helpers

## Template7 v1.0.0 - Released on September 12, 2014
