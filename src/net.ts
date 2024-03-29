
export type UnprocessedArticle = {
    title: string,
    html: string;
};
export type Article = {
    title: string,
    html: string;
};

export async function getArticle(name: string) {
    return await getArticleFollowRedirects(name, 0);
}

function unwrap(el: Node) {
	var parent = el.parentNode!;
	while (el.firstChild) parent.insertBefore(el.firstChild, el);
	parent.removeChild(el);
}

const badElements = [
    "[rel='mw-deduplicated-inline-style']",
    "[title='Name at birth']",
    "[aria-labelledby='micro-periodic-table-title']",
    ".barbox",
    ".wikitable",
    ".clade",
    ".Expand_section",
    ".nowrap",
    ".IPA",
    ".thumb",
    ".mw-empty-elt",
    ".mw-editsection",
    ".nounderlines",
    ".nomobile",
    ".searchaux",
    "#toc",
    ".sidebar",
    ".sistersitebox",
    ".noexcerpt",
    "#External_links",
    "#Further_reading",
    ".hatnote",
    ".haudio",
    ".portalbox",
    ".mw-references-wrap",
    ".infobox",
    ".unsolved",
    ".navbox",
    ".vertical-navbox",
    //".metadata",
    ".refbegin",
    ".reflist",
    ".mw-stack",
    "#Notes",
    "#References",
    ".reference",
    ".quotebox",
    ".collapsible",
    ".uncollapsed",
    ".mw-collapsible",
    ".mw-made-collapsible",
    ".mbox-small",
    ".mbox",
    "#coordinates",
    ".succession-box",
    ".noprint",
    ".mwe-math-element",
    ".cs1-ws-icon",
    "sup",
    "excerpt",
    "style",
    "img",
    "audio",
    "video"
];

const specialPunctuation = [
    'e.g.',
    'i.e.'
];

async function getArticleFollowRedirects(name: string, redirectCount: number) : Promise<UnprocessedArticle> {
    const resp = await fetch('https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + name + '&prop=text&formatversion=2&origin=*')
    if (!resp.ok) {
        throw `Server error: [${resp.status}] [${resp.statusText}] [${resp.url}]`;
    }
    const receivedJson = await resp.json();

    const el = document.createElement('div');
    el.innerHTML = receivedJson.parse.text;

    // Check for redirects
    const redirecting = el.getElementsByClassName('redirectMsg');
    if (redirecting.length > 0) {
        const redirURL = el.querySelector('.redirectText li a')!.innerHTML.replace(' ', '_');
        return await getArticleFollowRedirects(redirURL, redirectCount + 1);
    }
    return {
        title: receivedJson.parse.title,
        html: el.innerHTML
    };
}

export function processArticle(article : UnprocessedArticle) : Article {
    const el = document.createElement('div');

    let cleanHtml = article.html.replace(/â€“/g,'-');

    el.innerHTML = cleanHtml;
    const e = el.querySelector('.mw-parser-output')!;

    // Find the 'see also' section at the end of the page and remove everything after it
    const seeAlso = e.querySelector("#See_also")?.parentNode
        ?? e.querySelector("#Notes")?.parentNode
        ?? e.querySelector("#References")?.parentNode;

    if (seeAlso) {
        const alsoIndex = Array.prototype.indexOf.call(e.childNodes, seeAlso);
        while (alsoIndex > 0 && e.childNodes.length > alsoIndex) {
            e.removeChild(e.childNodes[alsoIndex]);
        }
    }

    // Remove bad elements
    badElements.forEach(sel => {
        el.querySelectorAll(sel).forEach(x => x.remove());
    });

    // Strip elements that mess with formatting
    el.querySelectorAll('a').forEach(x => unwrap(x));
    el.querySelectorAll('b').forEach(x => unwrap(x));
    el.querySelectorAll('small').forEach(x => unwrap(x));
    el.querySelectorAll('span[lang]').forEach(x => unwrap(x));

    el.querySelectorAll('blockquote').forEach(x => {
        x.innerHTML = x.innerHTML.replace(/<[^>]*>?/gm, '');
    });
    
    el.querySelectorAll('[title]').forEach(x => x.removeAttribute('title'));
    el.querySelectorAll('[class]').forEach(x => x.removeAttribute('class'));
    el.querySelectorAll('[style]').forEach(x => x.removeAttribute('style'));
    el.querySelectorAll('.mw-headline > *').forEach(x => unwrap(x));

    // Add article title
    const titleHolder = document.createElement('h1');
    const titleTxt = article.title.replace('_', ' ');
    titleHolder.innerText = titleTxt;
    e.prepend(titleHolder);

    // Common punctuation replacements
    el.innerHTML = el.innerHTML
        .replace(/\(; /g,'(')
        .replace(/\(, /g,'(')
        .replace(/\(, /g,'(')
        .replace(/: â€‹;/g,';')
        .replace(/ \(\) /g,' ')
        .replace('&nbsp;', ' ');

    const specialPunctuationReplaced = specialPunctuation.map(x => ({
        str: x,
        repl: x.replace(/([\.,:()\[\]?!;`\~\-\u2013\â€”&*"])/g, '<span class="punctuation">$1</span>') 
    }));

    // Detect punctuation
    Array.from(el.querySelectorAll('p, blockquote, h1, h2, table, li, i, cite, span'))
        .flatMap(x => Array.from(x.childNodes))
        .filter(x => x.nodeType == Node.TEXT_NODE)
        .forEach(x => {
            const replaceNode = document.createElement('div');
            let replaced = (x.textContent ?? '').replace(/([\.,:()\[\]?!;`\~\-\u2013\â€”&*"])/g, '<span class="punctuation">$1</span>');
            specialPunctuationReplaced.forEach(x => {
                replaced = replaced.replace(x.repl, '<span class="punctuation">' + x.str + '</span>');
            });
            replaceNode.innerHTML = replaced;
            x.replaceWith(...Array.from(replaceNode.childNodes));
        });
    
    // Split words
    Array.from(el.querySelectorAll('*'))
        .filter(x => !x.classList.contains('punctuation'))
        .flatMap(x => Array.from(x.childNodes))
        .filter(x => x.nodeType == Node.TEXT_NODE)
        .forEach(x => {
            if (!x.textContent) return;
            const replaceNode = document.createElement('div');
            replaceNode.innerHTML = x.textContent.replace(/(?<=^|\s)([^\s]+)(?=$|\s)/ig, '<span class="word">$1</span>');
            x.replaceWith(...Array.from(replaceNode.childNodes));
        });

    // Remove empty elements
    el.querySelectorAll(':empty').forEach(x => x.remove());

    return {
        title: titleTxt,
        html: el.innerHTML
    };
}
