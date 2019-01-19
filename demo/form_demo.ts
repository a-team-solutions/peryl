import * as form from "../src/form";
import { select } from "../src/dom";

const stringValidator = (entry: form.Entry, locale: string) => {
    switch (locale) {
        case "sk":
            return entry.getValue() ? "" : "Prázdna hodnota";
        default:
            return entry.getValue() ? "" : "Empty value";
    }
};

const numberValidator = (entry: form.Entry, locale: string) => {
    switch (locale) {
        case "sk":
            return entry.getValue() ? "" : "Prázdna hodnota";
        default:
            return entry.getValue() ? "" : "Empty value";
    }
};

const fileValidator = (entry: form.Entry, locale: string) => {
    const fileEntry = entry as form.FileEntry;
    switch (locale) {
        case "sk":
            return fileEntry.getFile() ? "" : "Prázdna hodnota";
        default:
            return fileEntry.getFile() ? "" : "Empty value";
    }
};

const showChange = (entry: form.Entry) => {
    select("#change").innerHTML = entry.getValue();
};

new form.Form("form")
    .addEntry(
        new form.TextInputEntry("name")
            .setValue("Peter")
            .setValidator(stringValidator)
            .onChange(showChange))
    .addEntry(
        new form.NumberInputEntry("age")
            .setStep(0.1)
            .setDecimals(2)
            .setValue("20")
            .enableMouseWheel()
            .enableMouseDrag()
            .setValidator(numberValidator)
            .onChange(showChange))
    .addEntry(
        new form.SelectEntry("sex")
            // .setOptions([
            //     { value: "A", text: "text A" },
            //     { value: "B", text: "text B" }])
            // .setValue("B")
            .setValue("F")
            .setValidator(stringValidator)
            .onChange(showChange))
    .addEntry(
        new form.CheckboxEntry("agree")
            .setValue(true.toString())
            .setValidator(stringValidator)
            .onChange(showChange))
    .addEntry(
        new form.RadioEntry(["yes-no-y", "yes-no-n"])
            .setValue("n")
            .setValidator(stringValidator)
            .onChange(showChange))
    .addEntry(
        new form.TextAreaEntry("text")
            .setValue("text text")
            .setValidator(stringValidator)
            .onChange(showChange))
    .addEntry(
        new form.FileEntry("file")
            .setValue("File")
            .setValidator(fileValidator)
            .onChange(showChange))
    .onSubmit((form: form.Form) => {
        const errors = form.validate("sk");
        for (const error in errors) {
            if (errors.hasOwnProperty(error)) {
                select("#" + error + "-err").innerHTML = errors[error];
            }
        }
        if (form.isValid(errors)) {
            select("#values").innerHTML = JSON.stringify(form.getValues());
        } else {
            select("#values").innerHTML = "";
        }
    });
