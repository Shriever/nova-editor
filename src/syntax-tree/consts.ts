export const TAB_SPACES = 4;

export enum InsertionType {
    Valid, //insertion can be made
    Invalid, //insertion cannot be made
    DraftMode, //insertion will trigger draft mode
}

export enum DataType {
    Number = "Number",
    Boolean = "Boolean",
    String = "String",
    Fractional = "Float",
    Iterator = "Iterator",
    AnyList = "ListAny",
    Set = "Set",
    Dict = "Dict",
    Class = "Class",
    Void = "Void",
    Any = "Any",

    //TODO: If there is ever time then DataType needs to be changed to a class to support nested types like these.
    //There are cases where we want to know what is inside the list such as for for-loop counter vars. They need to know
    //what they are iterating over otherwise no type can be assigned to them
    NumberList = "ListInt",
    BooleanList = "ListBool",
    StringList = "ListStr",
}

export const ListTypes = [DataType.AnyList, DataType.NumberList, DataType.BooleanList, DataType.StringList];
export const IndexableTypes = [...ListTypes, DataType.String];

export enum BinaryOperator {
    Add = "+",
    Subtract = "-",
    Multiply = "*",
    Divide = "/",
    Mod = "%",
    Pow = "**",
    LeftShift = "<<",
    RightShift = ">>",
    BitOr = "|",
    BitXor = "^",
    BitAnd = "&",
    FloorDiv = "//",

    And = "and",
    Or = "or",

    Equal = "==",
    NotEqual = "!=",
    LessThan = "<",
    LessThanEqual = "<=",
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    Is = "is",
    IsNot = "is not",
    In = "in",
    NotIn = "not in",
}

export enum AugmentedAssignmentOperator {
    Add = "+=",
    Subtract = "-=",
    Multiply = "*=",
    Divide = "/=",
    Mod = "%=",
    Pow = "**=",
    LeftShift = "<<=",
    RightShift = ">>=",
    BitOr = "|=",
    BitXor = "^=",
    BitAnd = "&=",
    FloorDiv = "//=",
}

export const arithmeticOps = [
    BinaryOperator.Add,
    BinaryOperator.Subtract,
    BinaryOperator.Multiply,
    BinaryOperator.Divide,
    BinaryOperator.Mod,
    BinaryOperator.Pow,
    BinaryOperator.LeftShift,
    BinaryOperator.RightShift,
    BinaryOperator.BitOr,
    BinaryOperator.BitXor,
    BinaryOperator.BitAnd,
    BinaryOperator.FloorDiv,
];
export const boolOps = [BinaryOperator.And, BinaryOperator.Or];
export const comparisonOps = [
    BinaryOperator.Equal,
    BinaryOperator.NotEqual,
    BinaryOperator.LessThan,
    BinaryOperator.LessThanEqual,
    BinaryOperator.GreaterThan,
    BinaryOperator.GreaterThanEqual,
    BinaryOperator.Is,
    BinaryOperator.IsNot,
    BinaryOperator.In,
    BinaryOperator.NotIn,
];

export enum BinaryOperatorCategory {
    Boolean = "Bool",
    Arithmetic = "Arithmetic",
    Comparison = "Comparison",
    Unspecified = "Unspecified",
}

export enum UnaryOp {
    Invert = "~",
    Not = "not",
    UAdd = "+",
    USub = "-",
}

export enum PythonKeywords {
    and = "and",
    as = "as",
    assert = "assert",
    break = "break",
    class = "class",
    continue = "continue",
    def = "def",
    del = "del",
    elif = "elif",
    else = "else",
    except = "except",
    False = "False",
    finally = "finally",
    for = "for",
    from = "from",
    global = "global",
    if = "if",
    import = "import",
    in = "in",
    is = "is",
    lambda = "lambda",
    None = "none",
    nonlocal = "nonlocal",
    not = "not",
    or = "or",
    pass = "pass",
    raise = "raise",
    return = "return",
    True = "True",
    try = "try",
    while = "while",
    with = "with",
    yield = "yield",
}

export enum BuiltInFunctions {
    abs = "abs",
    delattr = "delattr",
    hash = "hash",
    memoryview = "memoryview",
    set = "set",
    all = "all",
    dict = "dict",
    help = "help",
    min = "min",
    setattr = "setattr",
    any = "any",
    dir = "dir",
    hex = "hex",
    next = "next",
    slice = "slice",
    ascii = "ascii",
    divmod = "divmod",
    id = "id",
    object = "object",
    sorted = "sorted",
    bin = "bin",
    enumerate = "enumerate",
    input = "input",
    oct = "oct",
    staticmethod = "staticmethod",
    bool = "bool",
    eval = "eval",
    int = "int",
    open = "open",
    str = "str",
    breakpoint = "breakpoint",
    exec = "exec",
    isinstance = "isinstance",
    ord = "ord",
    sum = "sum",
    bytearray = "bytearray",
    filter = "filter",
    issubclass = "issubclass",
    pow = "pow",
    super = "super",
    bytes = "bytes",
    float = "float",
    iter = "iter",
    print = "print",
    tuple = "tuple",
    callable = "callable",
    format = "format",
    len = "len",
    property = "property",
    type = "type",
    chr = "chr",
    frozenset = "frozenset",
    list = "list",
    range = "range",
    vars = "vars",
    classmethod = "classmethod",
    getattr = "getattr",
    locals = "locals",
    repr = "repr",
    zip = "zip",
    compile = "compile",
    globals = "globals",
    map = "map",
    reversed = "reversed",
    __import__ = "__import__",
    complex = "complex",
    hasattr = "hasattr",
    max = "max",
    round = "round",
}

export enum AutoCompleteType {
    StartOfLine,
    LeftOfExpression,
    RightOfExpression,
    AtExpressionHole,
}

export const IdentifierRegex = RegExp("^[^\\d\\W]\\w*$");
export const NumberRegex = RegExp("^(([+-][0-9]+)|(([+-][0-9]*)\\.([0-9]+))|([0-9]*)|(([0-9]*)\\.([0-9]*)))$");
export const StringRegex = RegExp('^([^\\r\\n\\"]*)$');
