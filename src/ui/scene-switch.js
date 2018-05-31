const switchButton = document.querySelector('#scene-switch-btn');
const sceneIdBox = document.querySelector('#scene-id-input');

export function init() {
    switchButton.addEventListener('click', () => {
        const url = sceneIdBox.value;

        //const match = url.match(/modelResourceId=([^&]*)(?:$|&)/); //old
        const match = url.match(/[a-z0-9]{8}[-][a-z0-9]{4}[-][a-z0-9]{4}[-][a-z0-9]{4}[-][a-z0-9]{12}/);

        if(match == null || match.length === 0) {
            alert("Invalid URL! ");
        } else {
            var paras = document.getElementsByClassName('io3d-scene');

            while (paras[0]) {
                paras[0].parentNode.removeChild(paras[0])
            }

            window.location.hash = match;
        }
    });
}