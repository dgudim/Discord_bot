import { ICommand } from "wokcommands";
import { config, image_args_arr, sendToChannel } from "..";
import { getImageTag, sendImgToChannel, trimStringArray, walk } from "../utils";

let images: string[] = [];
let currImg = 0;

function checkArgument(value: any, name: any) {
    if (!value) {
        throw new Error(`The argument "${name}" cannot be empty`);
    }
}

async function filterAsync(array: string[], callback: Function) {
    checkArgument(array, 'array');
    checkArgument(callback, 'callback');
    const results = await Promise.all(array.map((value, index) => callback(value, index)));
    return array.filter((_, i) => results[i]);
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export default {

    category: 'Misc',
    description: 'Search image by tags',

    slash: true,
    testOnly: true,
    ownerOnly: false,
    hidden: false,

    expectedArgs: '<search-query> <index>',
    expectedArgsTypes: ['STRING', 'INTEGER'],
    minArgs: 0,
    maxArgs: 2,

    callback: async ({ channel, interaction }) => {

        let options = interaction.options;

        let searchQuery = options.getString("search-query");
        let index = options.getInteger("index");
        let empty = !searchQuery && index == null;

        if (empty && currImg == images.length - 1) {
            return 'No more images in list';
        } else if (empty) {
            sendImgToChannel(images[currImg], channel);
            currImg++;
            return 'Here is your image';
        }

        if (searchQuery){
            images = walk(config.get('img_dir'));

            interaction.reply({
                content: "searhing..."
            });

            let search_terms = trimStringArray(searchQuery.split(';'));
            for (let i = 0; i < search_terms.length; i++) {
                let search_term_split = trimStringArray(search_terms[i].split('='));
                if (search_term_split.length != 2) {
                    sendToChannel(channel, `Invalid search term ${search_terms[i]}`);
                } else {
                    if (image_args_arr.indexOf(search_term_split[0]) == -1) {
                        sendToChannel(channel, `No such xmp tag: ${search_term_split[0]}`);
                    } else {
                        let search_term_condition = trimStringArray(search_term_split[1].split(','));
                        for (let c = 0; c < search_term_condition.length; c++) {
                            images = await filterAsync(images, async (element: string, index: number) => {
                                return (await getImageTag(element, search_term_split[0])).includes(search_term_condition[c].toLowerCase());
                            });
                        }
                    }
                }
            }
            currImg = 0;
            sendToChannel(channel, `Found ${images.length} images`);
        }

        if(index != null){
            index = clamp(index, 0, images.length - 1);
            if (index > images.length - 1) {
                sendToChannel(channel, `Index too big, max is ${images.length - 1}`);
            } else {
                currImg = index;
                sendToChannel(channel, `Set current image index to ${index}`);
            }
        }
        
    }
} as ICommand