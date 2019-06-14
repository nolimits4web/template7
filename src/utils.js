import Template7Context from './context';

const Template7Utils = {
  quoteSingleRexExp: new RegExp('\'', 'g'),
  quoteDoubleRexExp: new RegExp('"', 'g'),
  isFunction(func) {
    return typeof func === 'function';
  },
  escape(string = '') {
    return string
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  helperToSlices(string) {
    const { quoteDoubleRexExp, quoteSingleRexExp } = Template7Utils;
    const helperParts = string.replace(/[{}#}]/g, '').trim().split(' ');
    const slices = [];
    let shiftIndex;
    let i;
    let j;
    for (i = 0; i < helperParts.length; i += 1) {
      let part = helperParts[i];
      let blockQuoteRegExp;
      let openingQuote;
      if (i === 0) slices.push(part);
      else if (part.indexOf('"') === 0 || part.indexOf('\'') === 0) {
        blockQuoteRegExp = part.indexOf('"') === 0 ? quoteDoubleRexExp : quoteSingleRexExp;
        openingQuote = part.indexOf('"') === 0 ? '"' : '\'';
        // Plain String
        if (part.match(blockQuoteRegExp).length === 2) {
          // One word string
          slices.push(part);
        } else {
          // Find closed Index
          shiftIndex = 0;
          for (j = i + 1; j < helperParts.length; j += 1) {
            part += ` ${helperParts[j]}`;
            if (helperParts[j].indexOf(openingQuote) >= 0) {
              shiftIndex = j;
              slices.push(part);
              break;
            }
          }
          if (shiftIndex) i = shiftIndex;
        }
      } else if (part.indexOf('=') > 0) {
        // Hash
        const hashParts = part.split('=');
        const hashName = hashParts[0];
        let hashContent = hashParts[1];
        if (!blockQuoteRegExp) {
          blockQuoteRegExp = hashContent.indexOf('"') === 0 ? quoteDoubleRexExp : quoteSingleRexExp;
          openingQuote = hashContent.indexOf('"') === 0 ? '"' : '\'';
        }
        if (hashContent.match(blockQuoteRegExp).length !== 2) {
          shiftIndex = 0;
          for (j = i + 1; j < helperParts.length; j += 1) {
            hashContent += ` ${helperParts[j]}`;
            if (helperParts[j].indexOf(openingQuote) >= 0) {
              shiftIndex = j;
              break;
            }
          }
          if (shiftIndex) i = shiftIndex;
        }
        const hash = [hashName, hashContent.replace(blockQuoteRegExp, '')];
        slices.push(hash);
      } else {
        // Plain variable
        slices.push(part);
      }
    }
    return slices;
  },
  stringToBlocks(string) {
    const blocks = [];
    let i;
    let j;
    if (!string) return [];
    const stringBlocks = string.split(/({{[^{^}]*}})/);
    for (i = 0; i < stringBlocks.length; i += 1) {
      let block = stringBlocks[i];
      if (block === '') continue;
      if (block.indexOf('{{') < 0) {
        blocks.push({
          type: 'plain',
          content: block,
        });
      } else {
        if (block.indexOf('{/') >= 0) {
          continue;
        }
        block = block
          .replace(/{{([#/])*([ ])*/, '{{$1')
          .replace(/([ ])*}}/, '}}');
        if (block.indexOf('{#') < 0 && block.indexOf(' ') < 0 && block.indexOf('else') < 0) {
          // Simple variable
          blocks.push({
            type: 'variable',
            contextName: block.replace(/[{}]/g, ''),
          });
          continue;
        }
        // Helpers
        const helperSlices = Template7Utils.helperToSlices(block);
        let helperName = helperSlices[0];
        const isPartial = helperName === '>';
        const helperContext = [];
        const helperHash = {};
        for (j = 1; j < helperSlices.length; j += 1) {
          const slice = helperSlices[j];
          if (Array.isArray(slice)) {
            // Hash
            helperHash[slice[0]] = slice[1] === 'false' ? false : slice[1];
          } else {
            helperContext.push(slice);
          }
        }

        if (block.indexOf('{#') >= 0) {
          // Condition/Helper
          let helperContent = '';
          let elseContent = '';
          let toSkip = 0;
          let shiftIndex;
          let foundClosed = false;
          let foundElse = false;
          let depth = 0;
          for (j = i + 1; j < stringBlocks.length; j += 1) {
            if (stringBlocks[j].indexOf('{{#') >= 0) {
              depth += 1;
            }
            if (stringBlocks[j].indexOf('{{/') >= 0) {
              depth -= 1;
            }
            if (stringBlocks[j].indexOf(`{{#${helperName}`) >= 0) {
              helperContent += stringBlocks[j];
              if (foundElse) elseContent += stringBlocks[j];
              toSkip += 1;
            } else if (stringBlocks[j].indexOf(`{{/${helperName}`) >= 0) {
              if (toSkip > 0) {
                toSkip -= 1;
                helperContent += stringBlocks[j];
                if (foundElse) elseContent += stringBlocks[j];
              } else {
                shiftIndex = j;
                foundClosed = true;
                break;
              }
            } else if (stringBlocks[j].indexOf('else') >= 0 && depth === 0) {
              foundElse = true;
            } else {
              if (!foundElse) helperContent += stringBlocks[j];
              if (foundElse) elseContent += stringBlocks[j];
            }
          }
          if (foundClosed) {
            if (shiftIndex) i = shiftIndex;
            if (helperName === 'raw') {
              blocks.push({
                type: 'plain',
                content: helperContent,
              });
            } else {
              blocks.push({
                type: 'helper',
                helperName,
                contextName: helperContext,
                content: helperContent,
                inverseContent: elseContent,
                hash: helperHash,
              });
            }
          }
        } else if (block.indexOf(' ') > 0) {
          if (isPartial) {
            helperName = '_partial';
            if (helperContext[0]) {
              if (helperContext[0].indexOf('[') === 0) helperContext[0] = helperContext[0].replace(/[[\]]/g, '');
              else helperContext[0] = `"${helperContext[0].replace(/"|'/g, '')}"`;
            }
          }
          blocks.push({
            type: 'helper',
            helperName,
            contextName: helperContext,
            hash: helperHash,
          });
        }
      }
    }
    return blocks;
  },
  parseJsVariable(expression, replace, object) {
    return expression.split(/([+ \-*/^()&=|<>!%:?])/g).reduce((arr, part) => {
      if (!part) {
        return arr;
      }
      if (part.indexOf(replace) < 0) {
        arr.push(part);
        return arr;
      }
      if (!object) {
        arr.push(JSON.stringify(''));
        return arr;
      }

      let variable = object;
      if (part.indexOf(`${replace}.`) >= 0) {
        part.split(`${replace}.`)[1].split('.').forEach((partName) => {
          if (partName in variable) variable = variable[partName];
          else variable = undefined;
        });
      }
      if (
        (typeof variable === 'string')
        || Array.isArray(variable)
        || (variable.constructor && variable.constructor === Object)
      ) {
        variable = JSON.stringify(variable);
      }
      if (variable === undefined) variable = 'undefined';

      arr.push(variable);
      return arr;
    }, []).join('');

  },
  parseJsParents(expression, parents) {
    return expression.split(/([+ \-*^()&=|<>!%:?])/g).reduce((arr, part) => {
      if (!part) {
        return arr;
      }

      if (part.indexOf('../') < 0) {
        arr.push(part);
        return arr;
      }

      if (!parents || parents.length === 0) {
        arr.push(JSON.stringify(''));
        return arr;
      }

      const levelsUp = part.split('../').length - 1;
      const parentData = levelsUp > parents.length ? parents[parents.length - 1] : parents[levelsUp - 1];

      let variable = parentData;
      const parentPart = part.replace(/..\//g, '');
      parentPart.split('.').forEach((partName) => {
        if (typeof variable[partName] !== 'undefined') variable = variable[partName];
        else variable = 'undefined';
      });
      if (variable === false || variable === true) {
        arr.push(JSON.stringify(variable));
        return arr;
      }
      if (variable === null || variable === 'undefined') {
        arr.push(JSON.stringify(''));
        return arr;
      }
      arr.push(JSON.stringify(variable));
      return arr;
    }, []).join('');
  },
  getCompileVar(name, ctx, data = 'data_1') {
    let variable = ctx;
    let parts;
    let levelsUp = 0;
    let newDepth;
    if (name.indexOf('../') === 0) {
      levelsUp = name.split('../').length - 1;
      newDepth = variable.split('_')[1] - levelsUp;
      variable = `ctx_${newDepth >= 1 ? newDepth : 1}`;
      parts = name.split('../')[levelsUp].split('.');
    } else if (name.indexOf('@global') === 0) {
      variable = 'Template7.global';
      parts = name.split('@global.')[1].split('.');
    } else if (name.indexOf('@root') === 0) {
      variable = 'root';
      parts = name.split('@root.')[1].split('.');
    } else {
      parts = name.split('.');
    }
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (part.indexOf('@') === 0) {
        let dataLevel = data.split('_')[1];
        if (levelsUp > 0) {
          dataLevel = newDepth;
        }
        if (i > 0) {
          variable += `[(data_${dataLevel} && data_${dataLevel}.${part.replace('@', '')})]`;
        } else {
          variable = `(data_${dataLevel} && data_${dataLevel}.${part.replace('@', '')})`;
        }
      } else if (Number.isFinite ? Number.isFinite(part) : Template7Context.isFinite(part)) {
        variable += `[${part}]`;
      } else if (part === 'this' || part.indexOf('this.') >= 0 || part.indexOf('this[') >= 0 || part.indexOf('this(') >= 0) {
        variable = part.replace('this', ctx);
      } else {
        variable += `.${part}`;
      }
    }
    return variable;
  },
  getCompiledArguments(contextArray, ctx, data) {
    const arr = [];
    for (let i = 0; i < contextArray.length; i += 1) {
      if (/^['"]/.test(contextArray[i])) arr.push(contextArray[i]);
      else if (/^(true|false|\d+)$/.test(contextArray[i])) arr.push(contextArray[i]);
      else {
        arr.push(Template7Utils.getCompileVar(contextArray[i], ctx, data));
      }
    }

    return arr.join(', ');
  },
};

export default Template7Utils;
