import {expect} from "chai";
import fs from "fs";
import {JSDOM} from "jsdom";
import css, {Rule} from "css";
import flatten from "array-flatten";
import {operate} from "../src/operate";

describe("filter with no style-tag at all", () => {
    it("will not touch the surrounding document", async () => {
        const inputFixture = fs.readFileSync(`${__dirname}/fixtures/no-style-tag.html`, {encoding: "utf8"});
        const unfilteredDom = new JSDOM(inputFixture);
        const filteredDom = new JSDOM(await operate(inputFixture));
        expect(unfilteredDom.serialize()).to.equal(filteredDom.serialize());
    });
});

describe("filter with single style-tag", () => {
    const inputFixture = fs.readFileSync(`${__dirname}/fixtures/single-style-tag.html`, {encoding: "utf8"});

    let unfilteredDom: JSDOM, filteredDom: JSDOM;
    let unfilteredStyleTag: ChildNode, filteredStyleTag: ChildNode;

    beforeEach(async () => {
        unfilteredDom = new JSDOM(inputFixture);
        filteredDom = new JSDOM(await operate(inputFixture));
        unfilteredStyleTag = unfilteredDom.window.document.childNodes[1].childNodes[0].childNodes[3];
        filteredStyleTag = filteredDom.window.document.childNodes[1].childNodes[0].childNodes[3];
    });

    it("will not touch the surrounding document", () => {
        unfilteredStyleTag.remove();
        filteredStyleTag.remove();

        expect(unfilteredDom.serialize()).to.equal(filteredDom.serialize());
    });

    it("will remove unused rules", () => {
        const filteredStyles = css.parse(filteredStyleTag.textContent as string);
        const rules: Array<Rule> = filteredStyles.stylesheet!.rules;

        const selectors = flatten(rules.map(rule => rule.selectors));
        expect(selectors).to.include.members([".used-class", "#used-id", "h1"]);
        expect(selectors).to.not.include.members([".unused-class", "#unused-id", "h2"]);
    });

    it("will remove unused selectors", () => {
        const filteredStyles = css.parse(filteredStyleTag.textContent as string);
        const rules: Array<Rule> = filteredStyles.stylesheet!.rules;

        const selectors = flatten(rules.map(rule => rule.selectors));
        expect(selectors).to.include.members([".used-class", "#used-id", "h1"]);
        expect(selectors).to.not.include.members([".unused-partial-class", "#unused-partial-id", "h3"]);
    });

    it("will minify the stylesheet", () => {
        expect(filteredStyleTag.textContent).to.equal(".used-class{color:#000}#used-id{color:#000}h1{color:#000}");
    });
});

describe("filter with multiple style-tags", () => {
    const inputFixture = fs.readFileSync(`${__dirname}/fixtures/multiple-style-tags.html`, {encoding: "utf8"});

    let unfilteredDom: JSDOM, filteredDom: JSDOM;
    let unfilteredStyleTag1: ChildNode, filteredStyleTag1: ChildNode, unfilteredStyleTag2: ChildNode, filteredStyleTag2: ChildNode;

    beforeEach(async () => {
        unfilteredDom = new JSDOM(inputFixture);
        filteredDom = new JSDOM(await operate(inputFixture));
        unfilteredStyleTag1 = unfilteredDom.window.document.childNodes[1].childNodes[0].childNodes[3];
        filteredStyleTag1 = filteredDom.window.document.childNodes[1].childNodes[0].childNodes[3];
        unfilteredStyleTag2 = unfilteredDom.window.document.childNodes[1].childNodes[0].childNodes[5];
        filteredStyleTag2 = filteredDom.window.document.childNodes[1].childNodes[0].childNodes[5];
    });

    it("will not touch the surrounding document", () => {
        unfilteredStyleTag1.remove();
        filteredStyleTag1.remove();
        unfilteredStyleTag2.remove();
        filteredStyleTag2.remove();

        expect(unfilteredDom.serialize()).to.equal(filteredDom.serialize());
    });

    it("will remove unused rules", () => {
        const filteredStyles1 = css.parse(filteredStyleTag1.textContent as string);
        const rules1: Array<Rule> = filteredStyles1.stylesheet!.rules;

        const selectors1 = flatten(rules1.map(rule => rule.selectors));
        expect(selectors1).to.include.members([".used-class", "#used-id", "h1"]);
        expect(selectors1).to.not.include.members([".unused-class", "#unused-id", "h2"]);

        const filteredStyles2 = css.parse(filteredStyleTag2.textContent as string);
        const rules2: Array<Rule> = filteredStyles2.stylesheet!.rules;

        const selectors2 = flatten(rules2.map(rule => rule.selectors));
        expect(selectors2).to.include.members([".used-class-2", "#used-id-2", "h4"]);
        expect(selectors2).to.not.include.members([".unused-class-2", "#unused-id-2", "h5"]);
    });

    it("will remove unused selectors", () => {
        const filteredStyles1 = css.parse(filteredStyleTag1.textContent as string);
        const rules1: Array<Rule> = filteredStyles1.stylesheet!.rules;

        const selectors1 = flatten(rules1.map(rule => rule.selectors));
        expect(selectors1).to.include.members([".used-class", "#used-id", "h1"]);
        expect(selectors1).to.not.include.members([".unused-partial-class", "#unused-partial-id", "h3"]);

        const filteredStyles2 = css.parse(filteredStyleTag2.textContent as string);
        const rules2: Array<Rule> = filteredStyles2.stylesheet!.rules;

        const selectors2 = flatten(rules2.map(rule => rule.selectors));
        expect(selectors2).to.include.members([".used-class-2", "#used-id-2", "h4"]);
        expect(selectors2).to.not.include.members([".unused-partial-class-2", "#unused-partial-id-2", "h6"]);
    });

    it("will minify the stylesheet", () => {
        expect(filteredStyleTag1.textContent).to.equal(".used-class{color:#000}#used-id{color:#000}h1{color:#000}");
        expect(filteredStyleTag2.textContent).to.equal(".used-class-2{color:#000}#used-id-2{color:#000}h4{color:#000}");
    });
});

describe("exceptions", () => {
    it("ignores amp style-tags", async () => {
        const fixture = fs.readFileSync(`${__dirname}/fixtures/amp-style-tag.html`, {encoding: "utf8"});
        const dom = new JSDOM(await operate(fixture));

        const styleTag = dom.window.document.childNodes[1].childNodes[0].childNodes[5];
        const styles = css.parse(styleTag.textContent!);
        const rules = styles.stylesheet!.rules as any;

        expect(rules.length).to.equal(1);
        expect(rules[0].selectors[0]).to.equal(".amp-styles-must-not-be-removed");
    });
});
