export default function shortenName (characterLimit, name, exception){
    let truncatedName;
    truncatedName = name
    ? name.length > characterLimit
      ? name.substring(0, characterLimit) + '...'
      : name
    : exception;
    return  truncatedName;
}

