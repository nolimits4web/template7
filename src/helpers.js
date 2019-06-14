/* eslint no-eval: "off" */
import Template7Utils from './utils';
import Template7Class from './template7-class';
import Template7Context from './context';

const Template7Helpers = {
  _partial(partialName, options) {
    const ctx = this;
    const p = Template7Class.partials[partialName];
    if (!p || (p && !p.template)) return '';
    if (!p.compiled) {
      p.compiled = new Template7Class(p.template).compile();
    }
    Object.keys(options.hash).forEach((hashName) => {
      ctx[hashName] = options.hash[hashName];
    });
    return p.compiled(ctx, options.data, options.root);
  },
  escape(context) {
    if (typeof context === 'undefined' || context === null) return '';
    if (typeof context !== 'string') {
      throw new Error('Template7: Passed context to "escape" helper should be a string');
    }
    return Template7Utils.escape(context);
  },
  if(context, options) {
    let ctx = context;
    if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
    if (ctx) {
      return options.fn(this, options.data);
    }

    return options.inverse(this, options.data);
  },
  unless(context, options) {
    let ctx = context;
    if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
    if (!ctx) {
      return options.fn(this, options.data);
    }

    return options.inverse(this, options.data);
  },
  each(context, options) {
    let ctx = context;
    let ret = '';
    let i = 0;
    if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
    if (Array.isArray(ctx)) {
      if (options.hash.reverse) {
        ctx = ctx.reverse();
      }
      for (i = 0; i < ctx.length; i += 1) {
        ret += options.fn(ctx[i], { first: i === 0, last: i === ctx.length - 1, index: i });
      }
      if (options.hash.reverse) {
        ctx = ctx.reverse();
      }
    } else {
      // eslint-disable-next-line
      for (const key in ctx) {
        i += 1;
        ret += options.fn(ctx[key], { key });
      }
    }
    if (i > 0) return ret;
    return options.inverse(this);
  },
  with(context, options) {
    let ctx = context;
    if (Template7Utils.isFunction(ctx)) { ctx = context.call(this); }
    return options.fn(ctx);
  },
  join(context, options) {
    let ctx = context;
    if (Template7Utils.isFunction(ctx)) { ctx = ctx.call(this); }
    return ctx.join(options.hash.delimiter || options.hash.delimeter);
  },
  js(expression, options) {
    const data = options.data;
    let func;
    let execute = expression;
    ('index first last key').split(' ').forEach((prop) => {
      if (typeof data[prop] !== 'undefined') {
        const re1 = new RegExp(`this.@${prop}`, 'g');
        const re2 = new RegExp(`@${prop}`, 'g');
        execute = execute
          .replace(re1, JSON.stringify(data[prop]))
          .replace(re2, JSON.stringify(data[prop]));
      }
    });
    if (options.root && execute.indexOf('@root') >= 0) {
      execute = Template7Utils.parseJsVariable(execute, '@root', options.root);
    }
    if (execute.indexOf('@global') >= 0) {
      execute = Template7Utils.parseJsVariable(execute, '@global', Template7Context.Template7.global);
    }
    if (execute.indexOf('../') >= 0) {
      execute = Template7Utils.parseJsParents(execute, options.parents);
    }
    if (execute.indexOf('return') >= 0) {
      func = `(function(){${execute}})`;
    } else {
      func = `(function(){return (${execute})})`;
    }
    return eval(func).call(this);
  },
  js_if(expression, options) {
    const data = options.data;
    let func;
    let execute = expression;
    ('index first last key').split(' ').forEach((prop) => {
      if (typeof data[prop] !== 'undefined') {
        const re1 = new RegExp(`this.@${prop}`, 'g');
        const re2 = new RegExp(`@${prop}`, 'g');
        execute = execute
          .replace(re1, JSON.stringify(data[prop]))
          .replace(re2, JSON.stringify(data[prop]));
      }
    });
    if (options.root && execute.indexOf('@root') >= 0) {
      execute = Template7Utils.parseJsVariable(execute, '@root', options.root);
    }
    if (execute.indexOf('@global') >= 0) {
      execute = Template7Utils.parseJsVariable(execute, '@global', Template7Context.Template7.global);
    }
    if (execute.indexOf('../') >= 0) {
      execute = Template7Utils.parseJsParents(execute, options.parents);
    }
    if (execute.indexOf('return') >= 0) {
      func = `(function(){${execute}})`;
    } else {
      func = `(function(){return (${execute})})`;
    }
    const condition = eval(func).call(this);
    if (condition) {
      return options.fn(this, options.data);
    }

    return options.inverse(this, options.data);
  },
};
Template7Helpers.js_compare = Template7Helpers.js_if;

export default Template7Helpers;
