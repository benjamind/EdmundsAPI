(function () {
    window.Edmundium = window.Edmundium || {};
    class Utils {
        static clearNode(node) {
            while (node.lastChild) {
                node.removeChild(node.lastChild);
            }
        }
        static updateList(listEl, items) {
            const fragment = document.createDocumentFragment();
            items.forEach((item) => {
                const option = document.createElement('option');
                const value = item && item.value ? item.value : item;
                const label = item && item.label ? item.label : item;
                option.setAttribute('value', value);
                option.innerText = label;
                fragment.appendChild(option);
            });
            Utils.clearNode(listEl);
            listEl.appendChild(fragment);
        }
    }
    Edmundium.Utils = Utils;
})();