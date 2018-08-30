declare module "Template7" {
    interface Template7{
        global?: any
        templates?: any;
        compile? (htmlString: string): any;
        registerHelper? (name: string, helper: Function): any;
        unregisterHelper? (name: string) : void;
        registerPartial? (name: string, template: string) : void;
        unregisterPartial? (name: string) : void;
    }

    const Template7 : Template7;

    export default Template7
}
