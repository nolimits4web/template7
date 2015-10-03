# Change Log

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