import util from "util";
import {JSDOM} from "jsdom";
import uncss from "uncss";
import CleanCss from "clean-css";

const filterUnusedCss = util.promisify(uncss);
const css = new CleanCss();

async function operate(input: string): Promise<string> {
    const dom = new JSDOM(input);
    const styleTags = Array.from(dom.window.document.querySelectorAll("style:not([amp-boilerplate])"));

    if (styleTags.length === 0) {
        return input;
    }

    await Promise.all(styleTags.map(async styleTag => {
        const filteredCss = await filterUnusedCss(input, {raw: styleTag.textContent});
        styleTag.textContent = css.minify(filteredCss).styles;
    }));

    return dom.serialize();
}

export {operate};
