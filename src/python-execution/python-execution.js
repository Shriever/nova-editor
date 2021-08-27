const parseUserCode = (code, hash, separator = ":") => {
    parsedCode = "import sys\n" + code;
    return parsedCode.replace(/(.*=)([str(]|[int(])?input\(['{1}|"{1}](.*)(\).*)/g, `$1print("${hash}${separator}$3)\ninput${hash}=sys.stdin.read()`);
};


module.exports = {parseUserCode}
