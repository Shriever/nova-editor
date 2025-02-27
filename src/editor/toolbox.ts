import { InsertionType } from "../syntax-tree/consts";
import { Module } from "../syntax-tree/module";
import { EditCodeAction } from "./action-filter";
import { EventAction, EventStack, EventType } from "./event-stack";
import * as options from "./toolbox.json";

export const EDITOR_DOM_ID = "editor";

export function addVariableReferenceButton(identifier: string, buttonId: string, events: EventStack): HTMLDivElement {
    const container = document.createElement("grid");
    container.classList.add("var-button-container");

    const button = document.createElement("div");
    button.classList.add("button");
    button.id = buttonId;

    const typeText = document.createElement("div");
    typeText.classList.add("var-type-text");

    container.appendChild(button);
    container.appendChild(typeText);

    document.getElementById("vars-button-grid").appendChild(container);

    button.textContent = identifier;

    button.addEventListener("click", () => {
        const action = new EventAction(EventType.OnButtonDown, button.id);
        events.stack.push(action);
        events.apply(action);
    });

    return button;
}

export function removeVariableReferenceButton(buttonId: string): void {
    const button = document.getElementById(buttonId);
    const parent = button.parentElement;
    document.getElementById("vars-button-grid").removeChild(parent);
}

export function addClassToButton(buttonId: string, className: string) {
    const button = document.getElementById(buttonId);

    if (button) {
        button.classList.add(className);
    }
}

export function removeClassFromButton(buttonId: string, className: string) {
    const button = document.getElementById(buttonId);

    if (button) {
        button.classList.remove(className);
    }
}

export function updateButtonsVisualMode(insertionRecords: EditCodeAction[]) {
    for (const insertionRecord of insertionRecords) {
        const button = document.getElementById(insertionRecord.cssId) as HTMLButtonElement;

        if (button) {
            if (insertionRecord.insertionType === InsertionType.DraftMode) {
                addClassToButton(insertionRecord.cssId, Module.draftModeButtonClass);
                removeClassFromButton(insertionRecord.cssId, Module.disabledButtonClass);
                button.disabled = false;
            } else if (insertionRecord.insertionType === InsertionType.Valid) {
                removeClassFromButton(insertionRecord.cssId, Module.draftModeButtonClass);
                removeClassFromButton(insertionRecord.cssId, Module.disabledButtonClass);
                button.disabled = false;
            } else {
                removeClassFromButton(insertionRecord.cssId, Module.draftModeButtonClass);
                addClassToButton(insertionRecord.cssId, Module.disabledButtonClass);
                button.disabled = true;
            }
        }
    }
}

export function loadToolboxFromJson() {
    const toolboxDiv = document.getElementById("editor-toolbox");

    const toolboxGroupOptions = options.toolboxConstructGroupOptions;

    for (const constructGroup in toolboxGroupOptions) {
        if (toolboxGroupOptions.hasOwnProperty(constructGroup) && toolboxGroupOptions[constructGroup].includeCategory) {
            let categoryDiv;
            if (toolboxGroupOptions[constructGroup].hasOwnProperty("categoryHtml")) {
                const template = document.createElement("template");
                template.innerHTML = toolboxGroupOptions[constructGroup].categoryHtml;
                categoryDiv = template.content.firstChild;
            } else {
                categoryDiv = document.createElement("div");
                categoryDiv.classList.add("group");

                const p = document.createElement("p");
                p.textContent = toolboxGroupOptions[constructGroup].categoryDisplayName;
                categoryDiv.appendChild(p);

                const itemOpts = toolboxGroupOptions[constructGroup].includeCategoryItems;
                for (const item in itemOpts) {
                    if (itemOpts.hasOwnProperty(item) && itemOpts[item]) {
                        const button = ToolboxButton.createToolboxButtonFromJsonObj(
                            options.toolboxDefaultButtonTemplates[item]
                        );
                        categoryDiv.appendChild(button.domElement);
                    }
                }
            }

            toolboxDiv.appendChild(categoryDiv);
        }
    }
}

export class ToolboxButton {
    domElement: HTMLDivElement;

    constructor(text: string, domId?: string, onClickAction?: Function) {
        if (onClickAction) {
            this.domElement.addEventListener("click", () => {
                onClickAction();
            });
        }

        this.domElement = document.createElement("div");
        this.domElement.classList.add("button");

        if (domId) {
            this.domElement.id = domId;
        }

        this.domElement.innerHTML = text.replace(/---/g, "<hole></hole>");
    }

    removeFromDOM() {
        this.domElement.remove();
    }

    static createToolboxButtonFromJsonObj(obj: { id?: string; text: string }) {
        return new ToolboxButton(obj.text, obj?.id);
    }
}
