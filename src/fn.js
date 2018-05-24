exports.isObject = item =>
{
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// originally from this stackoverflow link, and modified:
// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
exports.mergeDeep = ( target, source ) =>
{
  let output = Object.assign({}, target);
  if (exports.isObject(target) && exports.isObject(source)) {
    Object.keys(source).forEach(key => {
      if (exports.isObject(source[key])) {
        if (typeof source[key] !== 'undefined' && source[key] !== null && !(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = exports.mergeDeep(target[key], source[key]);
      } else if ( typeof source[key] !== 'undefined' && source[key] !== null ) {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
