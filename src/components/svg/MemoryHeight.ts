const typeToHeight = (type: string) => {
  let height = 0;
  switch (type) {
    case 'char':
      height = 1;
      break;
    case 'unsignedchar':
      height = 1;
      break;
    case 'short':
      height = 2;
      break;
    case 'unsignedshort':
      height = 2;
      break;
    case 'unsignedint':
      height = 4;
      break;
    case 'int':
      height = 4;
      break;
    case 'long':
      height = 4;
      break;
    case 'unsignedlong':
      height = 4;
      break;
    case 'float':
      height = 4;
      break;
    case 'double':
      height = 4;
      break;
  }
  if (type.endsWith('*')) {
    height = 4;
  }
  return height;
};
export default typeToHeight;
