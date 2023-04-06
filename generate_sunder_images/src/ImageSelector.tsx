import { ChangeEvent, Component, MouseEvent } from "react";
import { ChatCompletionRequestMessageRoleEnum, Configuration, ImagesResponse, ImagesResponseDataInner, OpenAIApi } from "openai";
import React from "react";
import * as fs from 'fs';
import LoadingIcons from 'react-loading-icons'

const configuration = new Configuration({
    organization: "org-t7CUSY8puQFgDGaesnEnJJ3w",
    apiKey: "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",
});
let openApi = new OpenAIApi(configuration)

export interface ImageSelectorProps {};
interface ImageSelectorState {
    begun: boolean,
    images: Array<ImagesResponseDataInner> | undefined,
    working: boolean,
    listOfCreatures: string[],
    currentCreature: string,
};

export class ImageSelectorComponent extends Component<ImageSelectorProps, ImageSelectorState> {
    constructor(props: ImageSelectorProps) {
        super(props); 

        this.state = {
            begun: false,
            images: undefined,
            working: false,
            currentCreature: "",
            listOfCreatures: []
        };
    }

    componentDidMount(): void {
        fetch("./current_cards")
            .then((r) => r.text())
            .then(text  => {
                let listOfCreatures = text.toString().split("\n")
                this.setState(
                    {
                        ...this.state,
                        listOfCreatures: listOfCreatures
                    }
                )
            })
    }

    forceDownloadImage(src: string, imageName: string) {
        const link = document.createElement('a');
        link.href = src;
        link.setAttribute(
            'download',
            `${imageName}.png`,
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
    }

    evt_GenerateNextCreature() {
        if (this.state.listOfCreatures.length == 0) {
            console.error("Atttempted to begin with no creatures")
        }

        let creatures = this.state.listOfCreatures
        console.log("Beginning generation with creature list: ", creatures)
        
        let first = creatures.pop()

        // The list will sometimes start with an empty string
        if (first == "") {
            first = creatures.pop()
        }
        
        // If the array was empty, we were given 0 creatures
        if (first == null) {
            console.error("No creatures given in file")
            return
        }


        console.log("First creature: ", first)
        this.setState(
            {
                ...this.state,
                listOfCreatures: creatures,
                currentCreature: first
            },
            () => {
                this.evt_BeginWorking(
                    this.generateImages.bind(this)
                )
            }
        )
    }

    // Set the current text in the input text box
    evt_setImages(images: Array<ImagesResponseDataInner>) {
        this.setState(
            {
                ...this.state,
                images: images,
                working: false
            }
        )
    }

    // Set the current text in the input text box
    evt_addImages(images: Array<ImagesResponseDataInner>) {
        let old = this.state.images ?? []
        this.setState(
            {
                ...this.state,
                images: [...old, ...images],
                working: false
            }
        )
    }

    evt_BeginWorking(onComplete?: () => any, flushImages: boolean = true) {
        this.setState(
            {
                ...this.state,
                working: true,
                images: flushImages ? undefined : this.state.images
            },
            onComplete
        )
    }

    evt_EndWorking(onComplete?: () => any) {
        this.setState(
            {
                ...this.state,
                working: false
            },
            onComplete
        )
    }

    // Event handler for submit button
    generateImages() {
        console.log("Sending query to DALL-E: ", this.state.currentCreature)
        openApi.createImage(
            {
                prompt: this.state.currentCreature,
                n: 5,
                size: "512x512",
                response_format: "b64_json"
            }
        ).then((value: any) => {
            let body = value.data as ImagesResponse;
            this.evt_EndWorking(() => {
                this.evt_setImages(body.data)
            })
        })
    }

    appendImages() {
        console.log("Sending query to DALL-E: ", this.state.currentCreature)
        openApi.createImage(
            {
                prompt: this.state.currentCreature,
                n: 5,
                size: "512x512",
                response_format: "b64_json"
            }
        ).then( (value: any) => {
            let body = value.data as ImagesResponse;
            this.evt_EndWorking(() => {
                this.evt_addImages(body.data)
            })
        })
    }

    hdl_ClickOnImage(e: MouseEvent<HTMLImageElement>) {
        // Download image and move to next line
        console.log(e.currentTarget.src)
        this.forceDownloadImage(e.currentTarget.src, this.state.currentCreature)
        this.evt_GenerateNextCreature()
    }

    hdl_Begin(e: MouseEvent<HTMLButtonElement>) {
        this.setState(
            {
                ...this.state,
                begun: true
            },
            this.evt_GenerateNextCreature.bind(this)
        )
    }

    hdl_Regen(e: MouseEvent<HTMLButtonElement>) {
        this.evt_BeginWorking(() => {
            this.appendImages()
        }, false)
    }

    render(): JSX.Element {
        let beginButton: JSX.Element | null = null
        if(!this.state.begun && this.state.listOfCreatures.length > 0) {
            beginButton = <button onClick={this.hdl_Begin.bind(this)}> Begin Generation </button>
        }
        
        let regenerateButton: JSX.Element | null = null
        if (this.state.begun && !this.state.working) {
            regenerateButton = <button onClick={this.hdl_Regen.bind(this)}> Regenerate Creature </button>
        }

        let images = this.state.images?.map( (value: ImagesResponseDataInner, index: number): JSX.Element => {
            return <img className="image" src={`data:image/png;base64,${value.b64_json}`} key={`image_${index}`} onClick={this.hdl_ClickOnImage.bind(this)} />
        })

        var loading: JSX.Element | null = null
        if (this.state.working || (!this.state.begun && this.state.listOfCreatures.length == 0)) {
            loading = <div className="loading">Loading...</div>
        }

        return <div className="screen">
            <div>
                Current Creature: {this.state.currentCreature}
            </div>
            <div>
                Remaining: {this.state.listOfCreatures.length}
            </div>
            <div>
                {loading}
                {regenerateButton}
            </div>
            <div>
                {beginButton}
            </div>
            <div className="container">
                {images}
            </div>
        </div>
    }

}