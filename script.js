// static/script.js
const copyToClipboard = (elementId) => {
    const copyText = document.getElementById(elementId);
    copyText.select();
    copyText.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(copyText.value)
        .then(() => {
            const copyAlert = document.getElementById("copyAlert");
            copyAlert.style.display = "block";
            setTimeout(() => {
                copyAlert.style.display = "none";
            }, 2000);
        })
        .catch(err => console.error('Error copying text: ', err));
};

const appendToReplaceTo = (value) => {
    const replaceToField = document.getElementById('replace_to');
    replaceToField.value += (replaceToField.value ? ',' : '') + value;
};

const appendToReplaceFrom = (value) => {
    const replaceToField = document.getElementById('replace_from');
    replaceToField.value += (replaceToField.value ? ',' : '') + value;
};

const increase = () => {
    const replaceToField = document.getElementById('replace_to');
    const items = replaceToField.value.split(',');

    if (items.length > 0) {
        const lastItem = items[items.length - 1].trim();
        const match = lastItem.match(/(\D*)(\d+)(\D*)/);

        if (match) {
            const [prefix, number, suffix] = match.slice(1);
            const incrementedNumber = String(parseInt(number, 10) + 1).padStart(number.length, '0');
            items.push(prefix + incrementedNumber + suffix);
        } else {
            items.push('01');
        }
    } else {
        items.push('01');
    }

    replaceToField.value = items.join(',');
};

const replaceXml = () => {
    try {
        const inputXml = document.getElementById('input_xml').value;
        const replaceFrom = document.getElementById('replace_from').value;
        const replaceToList = document.getElementById('replace_to').value.split(',');

        // Replace in XML
        let inputXmlClipboard = inputXml.replace('<?xml version="1.0" encoding="UTF-8"?>', '')
                                        .replace(/<multi-model-object>/g, '')
                                        .replace(/<\/multi-model-object>/g, '');

        let modifiedXml = replaceToList.map(replacement => {
            return inputXmlClipboard.replace(new RegExp(replaceFrom, 'g'), replacement);
        }).join('\n');

        modifiedXml = `<multi-model-object>\n${modifiedXml}\n</multi-model-object>`;
        modifiedXml = `<?xml version="1.0" encoding="UTF-8"?>\n${modifiedXml}`;

        // Update the output_xml textarea
        document.getElementById('output_xml').value = modifiedXml;
    } catch (error) {
        console.error('Error in replaceXml: ', error);
    }
};

const replaceXmlPlus = () => {
    try {
        const inputXml = document.getElementById('input_xml').value;
        const replaceFrom = document.getElementById('replace_from').value; // Original string to be replaced
        const replaceToList = document.getElementById('replace_to').value.split(',');

        // Replace in XML
        let inputXmlClipboard = inputXml.replace('<?xml version="1.0" encoding="UTF-8"?>', '')
                                        .replace(/<multi-model-object>/g, '')
                                        .replace(/<\/multi-model-object>/g, '');

        let modifiedXml = replaceToList.map(replacement => {
            // Create a case-insensitive regular expression for finding matches
            const regExp = new RegExp(replaceFrom, 'gi');
            return inputXmlClipboard.replace(regExp, (match) => {
                // Function to apply the case from the original match to the replacement string
                return match.split('').map((char, index) => {
                    // Check if the character in the original string is uppercase
                    const isUpperCase = char === char.toUpperCase();
                    if (index < replacement.length) {
                        // Apply the same case to the replacement character
                        return isUpperCase ? replacement.charAt(index).toUpperCase() : replacement.charAt(index).toLowerCase();
                    }
                    return ''; // In case the replacement is shorter than the match
                }).join('');
            });
        }).join('\n');

        modifiedXml = `<multi-model-object>\n${modifiedXml}\n</multi-model-object>`;
        modifiedXml = `<?xml version="1.0" encoding="UTF-8"?>\n${modifiedXml}`;

        // Update the output_xml textarea
        document.getElementById('output_xml').value = modifiedXml;
    } catch (error) {
        console.error('Error in replaceXml: ', error);
    }
};



const updateXmlNumbering = () => {
    try {
        const inputXml = document.getElementById('input_xml').value;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputXml, "text/xml");

        // Ensure the root name element stays the same
        const rootNameElement = xmlDoc.getElementsByTagName("name")[0];
        const rootNameText = rootNameElement.childNodes[0].nodeValue;

        const components = xmlDoc.getElementsByTagName("component");
        Array.from(components).forEach((component, index) => {
            const nameElement = component.getElementsByTagName("name")[0];
            const descriptionElement = component.getElementsByTagName("description")[0];

            if (nameElement && descriptionElement) {
                const baseName = rootNameText.replace('_class', '');
                const formattedName = `${baseName}_${(index + 1).toString().padStart(3, '0')}`;

                nameElement.textContent = formattedName;

                const formattedDescription = formattedName.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
                descriptionElement.textContent = formattedDescription;
            }
        });

        const serializer = new XMLSerializer();
        const updatedXml = serializer.serializeToString(xmlDoc);

        document.getElementById('output_xml').value = updatedXml;
    } catch (error) {
        console.error('Error in updateXmlDescriptions: ', error);
    }
};




const updateXmlDescriptions = () => {
    try {
        const inputXml = document.getElementById('input_xml').value;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputXml, "text/xml");

        const components = xmlDoc.getElementsByTagName("component");
        Array.from(components).forEach(component => {
            const nameElement = component.getElementsByTagName("name")[0];
            const descriptionElement = component.getElementsByTagName("description")[0];

            if (nameElement?.childNodes.length > 0 && descriptionElement) {
                const nameText = nameElement.childNodes[0].nodeValue;
                const formattedName = nameText.split('_').map((word, index) => {
                    return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase();
                }).join(' ');

                descriptionElement.textContent = formattedName;
            }
        });

        const serializer = new XMLSerializer();
        const updatedXml = serializer.serializeToString(xmlDoc);

        document.getElementById('output_xml').value = updatedXml;
    } catch (error) {
        console.error('Error in updateXmlDescriptions: ', error);
    }
};

const generateDaDimensionXml = () => {
    try {
        const inputXml = document.getElementById('input_xml').value;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputXml, "text/xml");

        const xpathQuery = xmlDoc.documentElement.tagName === "multi-model-object" ? ".//attribute/name" : ".//name";
        const names = xmlDoc.evaluate(xpathQuery, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        const newRoot = xmlDoc.createElement('multi-model-object');
        for (let i = 0; i < names.snapshotLength; i++) {
            const name = names.snapshotItem(i).textContent;
            const capitalizedAttr = name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('_');

            const propertyElement = xmlDoc.createElement('property');
            newRoot.appendChild(propertyElement);

            const nameElement = xmlDoc.createElement('name');
            nameElement.textContent = 'da_dimension';
            propertyElement.appendChild(nameElement);

            const valueElement = xmlDoc.createElement('value');
            valueElement.textContent = `${name};${capitalizedAttr}`;
            propertyElement.appendChild(valueElement);
        }

        const serializer = new XMLSerializer();
        const updatedXml = serializer.serializeToString(newRoot);
        document.getElementById('output_xml').value = `<?xml version="1.0" encoding="UTF-8"?>\n${updatedXml}`;
    } catch (error) {
        console.error('Error in generateDaDimensionXml: ', error);
    }
};

const generateDaFeatureStateXml = () => {
    try {
        const inputXml = document.getElementById('input_xml').value;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputXml, "text/xml");

        const xpathQuery = xmlDoc.documentElement.tagName === "multi-model-object" ? ".//attribute/name" : ".//name";
        const names = xmlDoc.evaluate(xpathQuery, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        const newRoot = xmlDoc.createElement('multi-model-object');
        for (let i = 0; i < names.snapshotLength; i++) {
            const name = names.snapshotItem(i).textContent;
            const capitalizedAttr = name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('_');

            const propertyElement = xmlDoc.createElement('property');
            newRoot.appendChild(propertyElement);

            const nameElement = xmlDoc.createElement('name');
            nameElement.textContent = 'da_feature_state';
            propertyElement.appendChild(nameElement);

            const valueElement = xmlDoc.createElement('value');
            valueElement.textContent = `${name};${capitalizedAttr}`;
            propertyElement.appendChild(valueElement);
        }

        const serializer = new XMLSerializer();
        const updatedXml = serializer.serializeToString(newRoot);
        document.getElementById('output_xml').value = `<?xml version="1.0" encoding="UTF-8"?>\n${updatedXml}`;
    } catch (error) {
        console.error('Error in generateDaDimensionXml: ', error);
    }
};

const createComponentFilter = () => {
    try {
        // Get the XML input from the textarea
        const inputXml = document.getElementById('input_xml').value;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputXml, "application/xml");

        // Extract attribute names
        const attributes = xmlDoc.getElementsByTagName('name');
        let names = [];
        for (let i = 0; i < attributes.length; i++) {
            names.push(attributes[i].textContent); // Ensure consistent text content retrieval
        }

        // Generate the output string formatted as required
        const outputString = names.map(name => `${name}=ancestor_attribute(${name})`).join(' and ');

        // Update the output area with the formatted string
        document.getElementById('output_xml').value = outputString;
    } catch (error) {
        console.error('Error in createComponentFilter: ', error);
        // Optionally update the output to show the error
        document.getElementById('output_xml').value = `Error: ${error.message}`;
    }
};
// Event listener for the button that triggers XML formatting
document.getElementById('format_xml_button').addEventListener('click', parseAndFormatXml);