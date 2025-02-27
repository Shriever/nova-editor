import { EditCodeAction } from "../editor/action-filter";
import { InsertActionType } from "../editor/consts";
import { Editor } from "../editor/editor";
import { EDITOR_DOM_ID } from "../editor/toolbox";
import { Validator } from "../editor/validator";
import { CodeConstruct, ListElementAssignment, TypedEmptyExpr, VarAssignmentStmt } from "../syntax-tree/ast";
import { BuiltInFunctions, PythonKeywords } from "../syntax-tree/consts";
import { Module } from "../syntax-tree/module";
import { TextEnhance } from "../utilities/text-enhance";
import { ConstructDoc } from "./construct-doc";

/*
 *A tree menu that can hold options for the user and link through those options to other menus.
 */
class Menu {
    //Menu object
    private isMenuOpen: boolean = false;
    options: MenuOption[] = [];
    editCodeActionsOptions: EditCodeAction[];

    /**
     * Index into this.options of an option that is currently focused and links to another menu.
     */
    openedLinkOptionIndex = -1;

    //tree structure
    children: Menu[] = [];
    parentMenu = null;

    //DOM
    static menuCount = 0;
    static idPrefix = "suggestion-menu-";
    htmlElement: HTMLDivElement;

    constructor(options: Map<string, Function>) {
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add(MenuController.menuElementClass);
        this.htmlElement.id = `${Menu.idPrefix}${Menu.menuCount}`;
        document.getElementById(EDITOR_DOM_ID).appendChild(this.htmlElement);

        Menu.menuCount++;

        for (const [key, value] of options) {
            const option = new MenuOption(key, false, null, this, null, value);
            option.attachToParentMenu(this);

            this.options.push(option);
        }

        this.htmlElement.addEventListener("mouseover", () => {
            this.htmlElement.style.visibility = "visible";
        });
    }

    //close any open sub-menus of menu
    closeChildren() {
        const activeChildren = this.children.filter((menu) => menu.isOpen);

        if (activeChildren.length > 0) {
            activeChildren.forEach((menu) => {
                menu.closeChildren();
                menu.close();
            });
        }
    }

    //indent children of this menu according to their level
    indentChildren(offset: number = 0) {
        if (this.children.length > 0) {
            const adjustment = offset + this.htmlElement.offsetWidth;
            this.children.forEach((child) => {
                child.htmlElement.style.left = `${adjustment}px`;

                if (child.children.length > 0) child.indentChildren(adjustment);
            });
        }
    }

    //Link this menu to a child through optionInParent
    linkMenuThroughOption(child: Menu, optionInParent: string) {
        const option = this.options.filter((option) => option.text === optionInParent)[0];

        if (option.hasChild()) option.setChildMenu(child);
        else {
            option.linkToChildMenu(child);
            option.selectAction = null;
            child.close();

            child.htmlElement.style.left = `${this.htmlElement.offsetWidth + this.htmlElement.offsetLeft}px`;

            this.addChildMenu(child);
        }
    }

    removeChild(child: Menu) {
        const childIndex = this.children.indexOf(child);

        if (childIndex > -1) {
            this.children.splice(childIndex, 1);
            child.removeFromDOM();
            this.removeLink(child);

            return true;
        }

        return false;
    }

    //Remove the option that links this menu to child from this menu and the DOM
    private removeLink(child: Menu) {
        const link = this.options.filter((option) => option.hasChild() && option.getChildMenu() === child)[0];
        this.options.splice(this.options.indexOf(link), 1);
        link.removeFromDOM();
    }

    //An empty option is one that does not link to another menu and also does not have a select action
    private countEmptyOptions() {
        let count = 0;

        this.options.forEach((option) => {
            if (!option.selectAction && !option.hasChild()) count++;
        });

        return count;
    }

    //Removes menu's that only serve as links (have a single option that links to another menu)
    static collapseSingleLinkMenus(root: Menu) {
        //this will collapse a menu that links to a single option as long as it is not the root menu
        if (root.parentMenu && root.options.length == 1 && root.children.length == 1) {
            const child = root.children[0];

            //move the child's options' DOM elements to root
            child.options.forEach((option) => {
                option.attachToParentMenu(root);
                const removedOption = child.htmlElement.removeChild(option.htmlElement);
                root.htmlElement.appendChild(removedOption);
            });

            //update root's children
            root.setChildMenus([...root.children, ...child.children]);
            root.removeChild(child);
            root.indentChildren(root.htmlElement.offsetLeft);

            root.options = child.options;

            //possible that root is a single option menu that links to another
            root = Menu.collapseSingleLinkMenus(root);

            return root;
        }

        //Do this for all nodes
        root.children.forEach((child) => {
            child = Menu.collapseSingleLinkMenus(child);
        });

        return root;
    }

    removeEmptyChildren() {
        if (this.children.length == 0) {
            //root could be a menu with options that had all of their links removed
            if (this.countEmptyOptions() == this.options.length && this.parentMenu) {
                this.parentMenu.removeChild(this);
            }
        }

        //some options might remain, but not link to a menu or have an action associated with them. These need to be removed
        //this is due to the fact that buildAvailableInsertsMenu() does not recursively check the menuMap for empty options
        let optionsToRemove = [];
        this.options.forEach((option) => {
            if (!option.hasChild() && !option.selectAction) {
                optionsToRemove.push(option);
            }
        });
        optionsToRemove.forEach((option) => {
            option.removeFromDOM();
        });
        optionsToRemove = optionsToRemove.map((option) => option.text);

        this.options = this.options.filter((option) => optionsToRemove.indexOf(option.text) == -1);

        this.children.forEach((child) => {
            child.removeEmptyChildren();
        });
    }

    open() {
        this.isMenuOpen = true;
        this.htmlElement.style.visibility = "visible";
    }

    close() {
        this.isMenuOpen = false;
        this.htmlElement.style.visibility = "hidden";

        //if we are closing this menu, the focused option needs to be reset
        this.options.forEach((option) => {
            option.removeFocus();
        });
    }

    isOpen() {
        return this.isMenuOpen;
    }

    //for bulk setting children
    setChildMenus(menus: Menu[]) {
        menus.forEach(
            ((menu) => {
                menu.parentMenu = this;
            }).bind(this)
        );

        this.children = menus;
    }

    addChildMenu(menu: Menu) {
        menu.parentMenu = this;
        this.children.push(menu);
    }

    removeFromDOM() {
        document.getElementById(EDITOR_DOM_ID).removeChild(this.htmlElement);
    }

    getOptionByText(optionText: string) {
        return this.options.filter((option) => option.text == optionText)[0];
    }
}

/**
 * An option within a menu that can link to another menu or perform an action when selected.
 */
class MenuOption {
    //menu this option links to
    private childMenu: Menu;
    //menu this option is a part of
    parentMenu: Menu;

    text: string;
    doc: ConstructDoc;
    htmlElement: HTMLDivElement;

    //action performed when this option is selected, null if this option links to another menu
    selectAction: Function;

    constructor(
        text: string = "Option Text",
        useInnerHTML: boolean = false,
        childMenu?: Menu,
        parentMenu?: Menu,
        doc?: ConstructDoc,
        selectAction?: Function,
        extraInformation?: string
    ) {
        this.text = text;
        this.childMenu = childMenu;
        this.parentMenu = parentMenu;
        this.doc = doc;
        this.selectAction = selectAction;

        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add(MenuController.optionElementClass);

        let textNode;

        text = text.replace(/---/g, "<hole></hole>");

        if (useInnerHTML) {
            textNode = document.createElement("div");
            textNode.innerHTML = text;
        } else {
            textNode = document.createElement("span");
            textNode.textContent = text;
        }

        textNode.classList.add(MenuController.optionTextElementClass);
        this.htmlElement.appendChild(textNode);

        if (extraInformation) {
            let extra = document.createElement("div");
            extra.innerHTML = extraInformation;
            extra.classList.add(MenuController.suggestionOptionExtraInfo);

            this.htmlElement.appendChild(extra);
        }

        this.addArrowImg();

        this.htmlElement.addEventListener(
            "mouseenter",
            (() => {
                MenuController.getInstance().focusOption(this);
            }).bind(this)
        );

        this.htmlElement.addEventListener("click", () => {
            this.select();
            MenuController.getInstance().removeMenus();
        });

        parentMenu.htmlElement.appendChild(this.htmlElement);
    }

    private addArrowImg() {
        if (this.childMenu) {
            const image = document.createElement("img");
            image.src = "./src/res/img/optionArrow.png";
            image.classList.add("optionArrowImage");
            this.htmlElement.appendChild(image);
        }
    }

    select() {
        if (this.childMenu) this.childMenu.open();
        else if (this.selectAction) this.selectAction();
    }

    linkToChildMenu(child: Menu) {
        this.childMenu = child;

        this.htmlElement.addEventListener("mouseenter", () => {
            this.childMenu.parentMenu.openedLinkOptionIndex = this.childMenu.parentMenu.options.indexOf(this);
            this.childMenu.open();
        });

        this.addArrowImg();
    }

    attachToParentMenu(menu: Menu) {
        this.parentMenu = menu;
    }

    hasChild() {
        return this.childMenu ? true : false;
    }

    getChildMenu() {
        return this.childMenu;
    }

    //highlights this option when it is focused on in the menu and opens its child menu if it has one
    setFocus() {
        this.htmlElement.classList.add(MenuController.selectedOptionElementClass);

        if (this.childMenu) {
            this.childMenu.open();
            this.childMenu.htmlElement.style.top = `${
                this.htmlElement.offsetTop +
                this.parentMenu.htmlElement.offsetTop -
                this.parentMenu.htmlElement.scrollTop
            }px`;
        } else if (this.doc) {
            this.doc.resetScroll();
            this.doc.show();
        }
    }

    //removes highlight from option when focused off and closes any child menus that were open
    removeFocus() {
        this.htmlElement.classList.remove(MenuController.selectedOptionElementClass);

        if (this.childMenu) this.parentMenu.closeChildren();
        else if (this.doc) this.doc.hide();
    }

    removeFromDOM() {
        this.parentMenu.htmlElement.removeChild(this.htmlElement);
    }

    setChildMenu(child: Menu) {
        this.childMenu = child;
    }
}

/**
 * Singleton controlling menu generation and removal as well as navigation through a menu
 */
export class MenuController {
    private static instance: MenuController;

    static suggestionOptionExtraInfo: string = "suggestionOptionExtraInfo";
    static optionElementClass: string = "suggestionOptionParent";
    static menuElementClass: string = "suggestionMenuParent";
    static optionTextElementClass: string = "suggestionOptionText";
    static selectedOptionElementClass: string = "selectedSuggestionOptionParent";

    module: Module;
    editor: Editor;
    indexOfRootMenu: number = -1;

    focusedMenuIndex: number = 0;
    focusedOptionIndex: number = -1;

    menus: Menu[] = [];

    private constructor() {}

    static getInstance() {
        if (!MenuController.instance) MenuController.instance = new MenuController();

        return MenuController.instance;
    }

    setInstance(module: Module, editor: Editor) {
        this.module = module;
        this.editor = editor;
    }

    /**
     * Build a single-node menu that contains all options provided by suggestions.
     *
     * @param suggestions An array of options this menu will have.
     *
     * @param actionMap   map of option names to their selectActions.
     *                    Provide an empty map if no custom actions are necessary.
     *
     * @param pos         Starting top-left corner of this menu in the editor.
     */
    buildSingleLevelMenu(suggestions: EditCodeAction[], pos: any = { left: 0, top: 0 }) {
        if (this.menus.length > 0) this.removeMenus();
        else if (suggestions.length > 0) {
            const menu = this.module.menuController.buildMenu(suggestions, pos);
            menu.open();
            this.indexOfRootMenu = 0;
            this.focusedOptionIndex = 0;
            menu.editCodeActionsOptions = suggestions;
            this.focusOption(menu.options[this.focusedOptionIndex]);
        }
    }

    /**
     * Helper for building a menu and assigning its options. Does not specify the tree structure. Simply constructs a Menu object.
     *
     * @param options the menu's options.
     * @param pos     Initial top-left corner of the menu.
     *
     * @returns the constructed menu. Null if no options was empty.
     */
    private buildMenu(options: EditCodeAction[], pos: any = { left: 0, top: 0 }) {
        if (options.length > 0) {
            const menuOptions = new Map<string, Function>();

            for (const action of options) {
                menuOptions.set(action.optionName, () => {
                    action.performAction(
                        this.module.executer,
                        this.module.eventRouter,
                        this.module.focus.getContext(),
                        {}
                    );
                });
            }

            const menu = new Menu(menuOptions);

            //TODO: These are the same values as the ones used for mouse offset by the Notifications so maybe make them shared in some util file
            menu.htmlElement.style.left = `${pos.left + document.getElementById(EDITOR_DOM_ID).offsetLeft}px`;
            menu.htmlElement.style.top = `${
                pos.top + parseFloat(window.getComputedStyle(document.getElementById(EDITOR_DOM_ID)).paddingTop)
            }px`;

            //TODO: No good way of separating responsibility completely because ready doc objects are stored in util instead of being created here.
            //I guess, it is always possible to have a list of active docs and loop through it here and update their positions instead of
            //using the static method to update them all. Do that in case this ever slows down anything.
            ConstructDoc.updateDocsLeftOffset(
                document.getElementById(EDITOR_DOM_ID).offsetLeft +
                    document.getElementById(`${Menu.idPrefix}${Menu.menuCount - 1}`).offsetWidth
            );

            this.menus.push(menu);

            return menu;
        }

        return null;
    }

    removeMenus() {
        this.menus.forEach((menu) => {
            menu.close();
            menu.removeFromDOM();
        });

        this.menus = [];
        this.focusedMenuIndex = 0;
        this.focusedOptionIndex = 0;
    }

    //Removes focus from currently focused option and sets it to the option below it.
    focusOptionBelow() {
        const options = this.menus[this.focusedMenuIndex].options;
        const optionDomElements = this.menus[this.focusedMenuIndex].htmlElement.getElementsByClassName(
            MenuController.optionElementClass
        );

        if (this.focusedOptionIndex != -1 && this.focusedOptionIndex != optionDomElements.length) {
            options[this.focusedOptionIndex].removeFocus();
        }

        this.focusedOptionIndex++;

        if (this.focusedOptionIndex == optionDomElements.length) {
            this.focusedOptionIndex = 0;
        }

        options[this.focusedOptionIndex].setFocus();
        if (options[this.focusedOptionIndex].hasChild()) {
            this.menus[this.focusedMenuIndex].openedLinkOptionIndex = this.focusedOptionIndex;
        }

        if (this.focusedOptionIndex == 0) {
            this.menus[this.focusedMenuIndex].htmlElement.scrollTop = 0;
        } else {
            this.menus[this.focusedMenuIndex].htmlElement.scrollTop += (
                optionDomElements[0] as HTMLDivElement
            ).offsetHeight;
        }
    }

    //Removes focus from currently focused option and sets it to the option above it.
    focusOptionAbove() {
        const options = this.menus[this.focusedMenuIndex].options;
        const optionDomElements = this.menus[this.focusedMenuIndex].htmlElement.getElementsByClassName(
            MenuController.optionElementClass
        );

        if (this.focusedOptionIndex != -1 && this.focusedOptionIndex != options.length) {
            options[this.focusedOptionIndex].removeFocus();
        }

        this.focusedOptionIndex--;

        if (this.focusedOptionIndex < 0) this.focusedOptionIndex = options.length - 1;

        options[this.focusedOptionIndex].setFocus();
        if (options[this.focusedOptionIndex].hasChild()) {
            this.menus[this.focusedMenuIndex].openedLinkOptionIndex = this.focusedOptionIndex;
        }

        if (this.focusedOptionIndex == options.length - 1) {
            this.menus[this.focusedMenuIndex].htmlElement.scrollTop =
                (optionDomElements[0] as HTMLDivElement).offsetHeight * options.length;
        } else {
            this.menus[this.focusedMenuIndex].htmlElement.scrollTop -= (
                optionDomElements[0] as HTMLDivElement
            ).offsetHeight;
        }
    }

    //Tracks the focused option for mouse interactions. Keys use focusOptionBelow(), focusOptionAbove(), openSubMenu() and closeSubMenu()
    focusOption(option: MenuOption) {
        //remove focus from any other options that may be focused within the currently focused menu
        if (this.focusedOptionIndex > -1 && this.focusedMenuIndex == this.menus.indexOf(option.parentMenu)) {
            this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex].removeFocus();
        }

        //update focus
        this.focusedMenuIndex = this.menus.indexOf(option.parentMenu);
        this.focusedOptionIndex = this.menus[this.focusedMenuIndex].options.indexOf(option);

        //if user navigated from child, need to clear options in newly focused menu as well
        this.menus[this.focusedMenuIndex].options.forEach((option) => {
            option.removeFocus();
        });

        this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex].setFocus();
    }

    //Open the menu, if any, that the currently focused option links to.
    openSubMenu() {
        if (this.focusedOptionIndex > -1) {
            const newFocusedMenu = this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex].getChildMenu();

            this.menus[this.focusedMenuIndex].openedLinkOptionIndex = this.focusedOptionIndex;

            if (newFocusedMenu) {
                this.selectFocusedOption();

                this.focusedMenuIndex = this.menus.indexOf(newFocusedMenu);
                this.focusedOptionIndex = 0;
                this.focusOption(this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex]);
            }
        }
    }

    //Close any open sub-menus when navigating up in the menu from the currently focused option.
    closeSubMenu() {
        if (this.menus[this.focusedMenuIndex].parentMenu) {
            this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex].removeFocus();
            this.focusedMenuIndex = this.menus.indexOf(this.menus[this.focusedMenuIndex].parentMenu);
            this.focusedOptionIndex = this.menus[this.focusedMenuIndex].openedLinkOptionIndex;
            this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex].setFocus();
            this.menus[this.focusedMenuIndex].closeChildren();
        }
    }

    //Perform the action associated with the currently focused option.
    selectFocusedOption() {
        if (this.focusedOptionIndex > -1) {
            this.menus[this.focusedMenuIndex].options[this.focusedOptionIndex].select();
        }
    }

    isMenuOpen() {
        return this.menus.length > 0 ? this.menus[this.indexOfRootMenu].isOpen() : false;
    }

    updateMenuArrayFromTree(root: Menu, isRoot: boolean) {
        if (isRoot) {
            this.indexOfRootMenu = 0;
            this.menus = [];
            this.focusedOptionIndex = 0;
            this.focusedMenuIndex = 0;
        }

        this.menus.push(root);

        root.children.forEach((child) => {
            this.updateMenuArrayFromTree(child, false);
        });
    }

    updateMenuOptions(optionText: string) {
        if (this.isMenuOpen()) {
            const textEnhance = new TextEnhance();
            const menu = this.menus[this.focusedMenuIndex];

            //get matches from fuse
            const searchResult = Validator.matchString(
                optionText,
                menu.editCodeActionsOptions.map((action) => action.optionName)
            );

            //filter EditCodeAction options based on what strings matched
            const searchResultStrings = searchResult.map((result) => result.item);
            let optionsToKeep = menu.editCodeActionsOptions.filter((action) =>
                action.matchRegex ? true : searchResultStrings.indexOf(action.optionName) > -1
            );

            /*Second round of filtering for regex-based items
              Currently only used by variable assignment
            */
            optionsToKeep = optionsToKeep.filter((editCodeAction) =>
                editCodeAction.matchRegex ? editCodeAction.matchRegex.test(optionText) : true
            );

            //recreate options
            let focusedOptionText = "";
            if (this.focusedOptionIndex > -1) {
                focusedOptionText = menu.options[this.focusedOptionIndex].text;
            }

            menu.options.forEach((option) => {
                option.removeFromDOM();
            });
            menu.options = [];

            for (const editAction of optionsToKeep) {
                let stringMatch; //user input if editAction has a matchRegex; a Fuse match object otherwise
                let substringMatchRanges = [];

                //TODO: If there are more constructs that need to have a custom performAction based on user input then consider changing this to be more general
                const currentStmt = this.module.focus.getFocusedStatement();
                const currentScope = currentStmt.hasScope() ? currentStmt.scope : currentStmt.rootNode.scope;

                //This case is for displaying [userInput] = --- as a suggestion on empty lines when there are no previous assignments to
                //a variable with the user input being the identifier
                if (
                    editAction.insertActionType === InsertActionType.InsertNewVariableStmt &&
                    currentScope.getAllAssignmentsToVarAboveLine(optionText, this.module, currentStmt.lineNumber)
                        .length === 0
                ) {
                    stringMatch = optionText + " = ---";
                    substringMatchRanges = [[[0, optionText.length - 1]]];
                    editAction.getCode = () => new VarAssignmentStmt("", optionText);
                }
                // for displaying the correct identifier for the ---[---] = --- option
                else if (editAction.insertActionType === InsertActionType.InsertListIndexAssignment) {
                    //TODO: Need to think about whether to remove this or not
                    stringMatch = optionText + "[---]= ---";
                    substringMatchRanges = [[[0, optionText.length - 1]]];
                    editAction.getCode = () => {
                        const code = new ListElementAssignment();
                        (code.tokens[0] as TypedEmptyExpr).text = optionText;

                        return code;
                    };
                }
                // Excludes var assignment because it would have been caught by the first case.
                // If it wasn't then that means that this variable exists and we should offer
                // only one option for its reassignment which will use a Modifier and turn into
                // a VarAssignmentStmt in the end anyway.

                // So this is simply for avoiding duplicate options between abc = --- (VarAssignmentStmt)
                // and abc = --- (VarOperationStmt)

                //The var assignment option cannot be removed any earlier than here because of case 1 of this if block
                else if (editAction.insertActionType === InsertActionType.InsertNewVariableStmt) {
                    continue;
                } else {
                    stringMatch = searchResult.filter((match) => match.item === editAction.optionName)[0];

                    if (stringMatch) {
                        for (const match of stringMatch.matches) {
                            substringMatchRanges.push(match.indices);
                        }
                    }
                }

                const optionDisplayText = textEnhance.getStyledSpanAtSubstrings(
                    stringMatch?.item ?? stringMatch,
                    "matchingText",
                    substringMatchRanges
                );

                //necessary so that we don't create variables with keywords as identifiers
                let option: MenuOption;

                if (
                    (editAction.insertActionType === InsertActionType.InsertNewVariableStmt &&
                        Object.keys(PythonKeywords).indexOf(optionText) == -1 &&
                        Object.keys(BuiltInFunctions).indexOf(optionText) == -1) ||
                    editAction.insertActionType !== InsertActionType.InsertNewVariableStmt
                ) {
                    let extraInfo = null;

                    if (editAction.matchRegex?.test(optionText) || editAction.matchString == optionText)
                        extraInfo = `press <span class="highlighted-text">${this.convertTerminatingChar(
                            editAction.terminatingChars[0]
                        )}</span> to insert`;

                    option = new MenuOption(
                        optionDisplayText,
                        true,
                        null,
                        menu,
                        null,
                        () => {
                            editAction.performAction(
                                this.module.executer,
                                this.module.eventRouter,
                                this.module.focus.getContext(),
                                {}
                            );
                        },
                        extraInfo
                    );

                    this.insertOptionIntoMenu(option, menu);

                    if (option.text === focusedOptionText) {
                        this.focusedOptionIndex = menu.options.length - 1;
                        option.htmlElement.classList.add(MenuController.selectedOptionElementClass);
                    } else {
                        this.focusedOptionIndex = 0;
                    }
                }
            }

            if (menu.options.length == 0) {
                const option = new MenuOption("No suitable options found.", false, null, menu, null, () => {});
                this.insertOptionIntoMenu(option, menu);
                this.focusedOptionIndex = 0;
            } else if (this.focusedOptionIndex < menu.options.length) {
                this.focusOption(menu.options[this.focusedOptionIndex]);
            } else {
                console.error("suggestion-controller: this.focusedOptionIndex >= menu.options.length");
            }
        }
    }

    updatePosition(pos: { left: number; top: number }) {
        this.menus[this.focusedMenuIndex].htmlElement.style.left = `${pos.left}px`;
        this.menus[this.focusedMenuIndex].htmlElement.style.top = `${pos.top}px`;
    }

    getNewMenuPosition(code: CodeConstruct): { left: number; top: number } {
        const pos = { left: 0, top: 0 };
        pos.left =
            document.getElementById(EDITOR_DOM_ID).offsetLeft +
            (
                document
                    .getElementById(EDITOR_DOM_ID)
                    .getElementsByClassName("monaco-editor no-user-select  showUnused showDeprecated vs")[0]
                    .getElementsByClassName("overflow-guard")[0]
                    .getElementsByClassName("margin")[0] as HTMLElement
            ).offsetWidth +
            (this.module.editor.computeCharWidth()
                ? code.getRenderText().length * this.module.editor.computeCharWidth()
                : 0);

        pos.top =
            this.module.editor.monaco.getSelection().startLineNumber * this.module.editor.computeCharHeight() +
            parseFloat(window.getComputedStyle(document.getElementById(EDITOR_DOM_ID)).paddingTop);

        return pos;
    }

    private convertTerminatingChar(text: string): string {
        if (text == " ") return "space";
        else return text;
    }

    private insertOptionIntoMenu(option: MenuOption, menu: Menu) {
        option.attachToParentMenu(menu);
        menu.options.push(option);
    }
}
