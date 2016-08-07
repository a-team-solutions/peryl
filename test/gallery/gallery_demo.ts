/// <reference path="../../src/prest/prest-component.ts" />
/// <reference path="./gallery.ts" />

window.onload = () => {

    var items:components.Item [] = [];
    for (var i = 2; i < 7; i++) {
        items.push({
            title: 'Image ' + i,
            url: `http://javascript.info/files/tutorial/browser/events/gallery/img${i}-lg.jpg`,
            thumb: `http://javascript.info/files/tutorial/browser/events/gallery/img${i}-thumb.jpg`
        });
    }
    // items = items.concat(items);
    // console.log(items);

    var gallery = new components.Gallery(items);

    gallery.onSelect((item) => {
        console.log('selected:', item);
        var selected = document.getElementById('selected') as HTMLSpanElement;
        selected.innerHTML = JSON.stringify(item);
    });

    var galleryElement = gallery.render();

    var container = document.getElementById('gallery') as HTMLDivElement;
    container.appendChild(galleryElement);
};
