import Template7Utils from './utils';
import Template7Helpers from './helpers';
import Template7Context from './context';

const Template7Options = {};
const Template7Partials = {};
const script = Template7Context.document.createElement('script');
Template7Context.document.head.appendChild(script);

class Template7Class {
  constructor(template) {
    const t = this;
    t.template = template;
  }
  compile(template = this.template, depth = 1) {
    const t = this;
    if (t.compiled) return t.compiled;

    if (typeof template !== 'string') {
      throw new Error('Template7: Template must be a string');
    }
    const { stringToBlocks, getCompileVar, getCompiledArguments } = Template7Utils;

    const blocks = stringToBlocks(template);
    const ctx = `ctx_${depth}`;
    const data = `data_${depth}`;
    if (blocks.length === 0) {
      return function empty() { return ''; };
    }

    function getCompileFn(block, newDepth) {
      if (block.content) return t.compile(block.content, newDepth);
      return function empty() { return ''; };
    }
    function getCompileInverse(block, newDepth) {
      if (block.inverseContent) return t.compile(block.inverseContent, newDepth);
      return function empty() { return ''; };
    }

    let resultString = '';
    if (depth === 1) {
      resultString += `(function (${ctx}, ${data}, root) {\n`;
    } else {
      resultString += `(function (${ctx}, ${data}) {\n`;
    }
    if (depth === 1) {
      resultString += 'function isArray(arr){return Array.isArray(arr);}\n';
      resultString += 'function isFunction(func){return (typeof func === \'function\');}\n';
      resultString += 'function c(val, ctx) {if (typeof val !== "undefined" && val !== null) {if (isFunction(val)) {return val.call(ctx);} else return val;} else return "";}\n';
      resultString += 'root = root || ctx_1 || {};\n';
    }
    resultString += 'var r = \'\';\n';
    let i;
    for (i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      // Plain block
      if (block.type === 'plain') {
        // eslint-disable-next-line
        resultString += `r +='${(block.content).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/'/g, '\\' + '\'')}';`;
        continue;
      }
      let variable;
      let compiledArguments;
      // Variable block
      if (block.type === 'variable') {
        variable = getCompileVar(block.contextName, ctx, data);
        resultString += `r += c(${variable}, ${ctx});`;
      }
      // Helpers block
      if (block.type === 'helper') {
        let parents;
        if (ctx !== 'ctx_1') {
          const level = ctx.split('_')[1];
          let parentsString = `ctx_${level - 1}`;
          for (let j = level - 2; j >= 1; j -= 1) {
            parentsString += `, ctx_${j}`;
          }
          parents = `[${parentsString}]`;
        } else {
          parents = `[${ctx}]`;
        }
        let dynamicHelper;
        if (block.helperName.indexOf('[') === 0) {
          block.helperName = getCompileVar(block.helperName.replace(/[[\]]/g, ''), ctx, data);
          dynamicHelper = true;
        }
        if (dynamicHelper || block.helperName in Template7Helpers) {
          compiledArguments = getCompiledArguments(block.contextName, ctx, data);
          resultString += `r += (Template7Helpers${dynamicHelper ? `[${block.helperName}]` : `.${block.helperName}`}).call(${ctx}, ${compiledArguments && (`${compiledArguments}, `)}{hash:${JSON.stringify(block.hash)}, data: ${data} || {}, fn: ${getCompileFn(block, depth + 1)}, inverse: ${getCompileInverse(block, depth + 1)}, root: root, parents: ${parents}});`;
        } else if (block.contextName.length > 0) {
          throw new Error(`Template7: Missing helper: "${block.helperName}"`);
        } else {
          variable = getCompileVar(block.helperName, ctx, data);
          resultString += `if (${variable}) {`;
          resultString += `if (isArray(${variable})) {`;
          resultString += `r += (Template7Helpers.each).call(${ctx}, ${variable}, {hash:${JSON.stringify(block.hash)}, data: ${data} || {}, fn: ${getCompileFn(block, depth + 1)}, inverse: ${getCompileInverse(block, depth + 1)}, root: root, parents: ${parents}});`;
          resultString += '}else {';
          resultString += `r += (Template7Helpers.with).call(${ctx}, ${variable}, {hash:${JSON.stringify(block.hash)}, data: ${data} || {}, fn: ${getCompileFn(block, depth + 1)}, inverse: ${getCompileInverse(block, depth + 1)}, root: root, parents: ${parents}});`;
          resultString += '}}';
        }
      }
    }
    resultString += '\nreturn r;})';

    if (depth === 1) {
      // eslint-disable-next-line
      t.compiled = eval(resultString);
      return t.compiled;
    }
    return resultString;
  }
  static get options() {
    return Template7Options;
  }
  static get partials() {
    return Template7Partials;
  }
  static get helpers() {
    return Template7Helpers;
  }
}
export default Template7Class;
