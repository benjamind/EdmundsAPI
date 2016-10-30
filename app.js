(function () {
    const api = new Edmundium.API(Edmundium.apiKey);
    const model = new Edmundium.MaintenanceModel(api);
    const utils = Edmundium.Utils;
    // retrieve elements for use later
    const yearsList = document.querySelector('#yearsList');
    const makesList = document.querySelector('#makesList');
    const modelsList = document.querySelector('#modelsList');
    const trimList = document.querySelector('#trimList');
    const transmissionList = document.querySelector('#transmissionList');
    const engineList = document.querySelector('#engineList');
    const zipCode = document.querySelector('#zipCode');
    const form = document.querySelector('#maintenanceForm');
    const templateAction = document.querySelector('#actionTemplate');
    const scheduleBody = document.querySelector('#scheduleBody');
    const content = document.querySelector('#content');
    const vehicleName = document.querySelector('#vehicleName');
    const photos = document.querySelector('#photos');
    const submit = document.querySelector('#maintenanceFormSubmit');

    // populate year box from initial list in model
    const yearEntries = [
        { label: '--', value: null },
    ];
    model.Years.forEach((year) => {
        yearEntries.push({ label: year, value: year });
    });
    utils.updateList(yearsList, yearEntries);

    const setListStates = () => {
        makesList.disabled = model.Makes.size === 0;
        modelsList.disabled = model.Models.size === 0;
        trimList.disabled = model.Styles.size === 0;
        transmissionList.disabled = model.Transmissions.size === 0;
        engineList.disabled = model.Engines.size === 0;
    }
  

    // hook each UI element to its appropriate model handler
    yearsList.addEventListener('change', (evt) => {
        const year = evt.currentTarget.value;
        model.Year = parseInt(year, 10);
    });
    makesList.addEventListener('change', (evt) => {
        const make = evt.currentTarget.value;
        model.Make = make;
    });
    modelsList.addEventListener('change', (evt) => {
        const modelId = evt.currentTarget.value;
        model.Model = modelId;
    });
    trimList.addEventListener('change', (evt) => {
        const styleId = parseInt(evt.currentTarget.value, 10); // remember to parse ids back to ints
        model.Style = styleId;
    });
    transmissionList.addEventListener('change', (evt) => {
        const transmission = parseInt(evt.currentTarget.value, 10); // remember to parse ids back to ints
        model.Transmission = transmission;
    });
    engineList.addEventListener('change', (evt) => {
        const engine = parseInt(evt.currentTarget.value, 10); // remember to parse ids back to ints
        model.Engine = engine;
    });
    zipCode.addEventListener('change', (evt) => {
        const value = evt.currentTarget.value;
        const isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value);
        if (!isValidZip) {
            evt.currentTarget.classList.add('invalid');
        } else {
            evt.currentTarget.classList.remove('invalid');
        }
    });

    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        // set loading state on content
        content.setAttribute('data-state', 'loading');
        model.GetSchedule();
    });

    // when makes list changes update makes list and enable it
    model.addListener('makesChanged', (makes) => {
        const entries = [
            { label: '--', value: null },
        ];
        makes.forEach((entry, make) => {
            entries.push({ label: entry.name, value: make });
        });
        utils.updateList(makesList, entries);
        setListStates();
    });
    model.addListener('modelsChanged', (models) => {
        const entries = [
            { label: '--', value: null },
        ];
        models.forEach((entry, model) => {
            entries.push({ label: entry.name, value: model });
        });
        utils.updateList(modelsList, entries);
        setListStates();
    });
    model.addListener('stylesChanged', (styles) => {
        const entries = [
            { label: '--', value: null },
        ];
        styles.forEach((entry, styleId) => {
            entries.push({ label: entry.name, value: styleId });
        });
        utils.updateList(trimList, entries);
        setListStates();
    });
    model.addListener('transmissionsChanged', (transmissions) => {
        const entries = [
            { label: '--', value: null },
        ];
        transmissions.forEach((entry, transmissionId) => {
            const name = `${entry.transmissionType} - ${entry.numberOfSpeeds} speed`; 
            entries.push({ label: name, value: transmissionId });
        });
        utils.updateList(transmissionList, entries);
        setListStates();
    });
    model.addListener('enginesChanged', (engines) => {
        const entries = [
            { label: '--', value: null },
        ];
        // filter the engines list for actual engine entries (exclude optional details)
        const filteredEngines = Array.from(engines.values()).filter((entry) => {
            return entry.cylinder && entry.size;
        });
        filteredEngines.forEach((entry) => {
            const name = `${entry.cylinder} cyl ${entry.size} liter`;
            entries.push({ label: name, value: entry.id });
        });
        utils.updateList(engineList, entries);
        setListStates();
    });
    model.addListener('valid', (isValid) => {
        submit.disabled = !isValid;
    });
    const makeTemplateAction = (template, action, item, partCost, laborHours) => {
        let formattedCost = '';
        let formattedHours = '';
        template.content.querySelector('.action').textContent = action;
        template.content.querySelector('.item').textContent = item;
        if (partCost > 0) {
            formattedCost = `&dollar;${partCost.toFixed(2)}`;
        }
        template.content.querySelector('.parts-cost').innerHTML = formattedCost;
        if (laborHours > 0) {
            formattedHours = laborHours;
        }
        template.content.querySelector('.labor-hours').textContent = formattedHours;
        return document.importNode(template.content, true);
    };
    model.addListener('maintenanceChanged', (items) => {
        utils.clearNode(scheduleBody);
        if (items.length <= 0) {
            content.setAttribute('data-state', 'no-results');
            return;
        }
        content.setAttribute('data-state', 'results');
        items.forEach(({
            action,
            item,
            laborUnits,
            partUnits,
            partCostPerUnit,
        }) => {
            const node = makeTemplateAction(
                templateAction,
                action,
                item,
                partUnits && partCostPerUnit ? partUnits * partCostPerUnit : 0,
                laborUnits
            );
            // get description string about the selected model
            const year = model.Year;
            const make = model.Makes.get(model.Make);
            const vehicleModel = model.Models.get(model.Model);
            const vehicleNameString = `${year} ${make.name} ${vehicleModel.name}`;
            vehicleName.textContent = vehicleNameString;
            scheduleBody.appendChild(node);
        });
    });
    model.addListener('photosChanged', (photosList) => {
        utils.clearNode(photos);
        if (photosList.length > 0) {
            // spit out all the thumbnails
            const photoFragment = document.createDocumentFragment();
            photosList.forEach((photo) => {
                // find the thumbnails
                const thumbs = photo.sources.filter((source) => {
                    return source.size.width === 98 && source.size.height === 65;
                });
                // lets only print 6
                thumbs = thumbs.slice(0, 6);
                thumbs.forEach((thumb) => {
                    const photoEl = document.createElement('img');
                    const href = thumb.link.href;
                    photoEl.src = `http://media.ed.edmunds-media.com${href}`;
                    photoFragment.appendChild(photoEl);
                });
            });
            photos.appendChild(photoFragment);
        }
    });
})();