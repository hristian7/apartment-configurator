const link = document.querySelector('#company-link');


export function init() {

    const href = link.href;
    link.href = null;
    link.onclick = () => {
        window.open(href);
    };

}