(function (Scratch) {
    "use strict";

    class BoatE {
        constructor() {
            this.API = "https://boat-e-image-gen.danielmat639.workers.dev/image";

            // Memory system
            this.images = [];   // [{ prompt, image }]
            this.prompts = [];  // ["prompt1", "prompt2", ...]
        }

        getInfo() {
            return {
                id: "BoatE",
                name: "Boat‑E Image Gen",
                color1: "#4BA3FF",
                color2: "#2C7CD1",
                color3: "#1A4F80",

                blocks: [
                    // (generate image (input))
                    {
                        opcode: "generateImageReporter",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "generate image [PROMPT]",
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "pixel robot"
                            }
                        }
                    },

                    // [generate image (input)]
                    {
                        opcode: "generateImageCommand",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "generate image [PROMPT]",
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "pixel robot"
                            }
                        }
                    },

                    // [use generated image with prompt (input) as costume]
                    {
                        opcode: "useImageAsCostume",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "use generated image with prompt [PROMPT] as costume",
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "pixel robot"
                            }
                        }
                    },

                    // (latest image generation)
                    {
                        opcode: "latestImage",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "latest image generation"
                    },

                    // (all image generations)
                    {
                        opcode: "allImages",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "all image generations"
                    },

                    // [clear memory]
                    {
                        opcode: "clearMemory",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "clear memory"
                    },

                    // (prompt memory)
                    {
                        opcode: "promptMemory",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "prompt memory"
                    }
                ]
            };
        }

        // Core generator
        async generate(prompt) {
            const response = await fetch(this.API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (!data.success) return "";

            // Save to memory
            this.images.push({ prompt, image: data.image });
            this.prompts.push(prompt);

            return data.image;
        }

        // (generate image (input))
        async generateImageReporter(args) {
            return await this.generate(args.PROMPT);
        }

        // [generate image (input)]
        async generateImageCommand(args) {
            await this.generate(args.PROMPT);
        }

        // [use generated image with prompt (input) as costume]
        async useImageAsCostume(args, util) {
            const base64 = await this.generate(args.PROMPT);
            if (!base64) return;

            const costume = {
                name: `BoatE_${Date.now()}`,
                dataFormat: "png",
                assetId: null,
                md5ext: null,
                rotationCenterX: 0,
                rotationCenterY: 0
            };

            const asset = new Scratch.Storage.Asset(
                Scratch.Storage.AssetType.ImageBitmap,
                null,
                Scratch.Storage.DataFormat.PNG,
                base64.split(",")[1],
                true
            );

            costume.assetId = asset.assetId;
            costume.md5ext = asset.assetId + ".png";

            const sprite = util.target.sprite;
            sprite.costumes.push(costume);
            sprite.setCostume(sprite.costumes.length - 1);
        }

        // (latest image generation)
        latestImage() {
            if (this.images.length === 0) return "";
            return this.images[this.images.length - 1].image;
        }

        // (all image generations)
        allImages() {
            return JSON.stringify(this.images);
        }

        // [clear memory]
        clearMemory() {
            this.images = [];
            this.prompts = [];
        }

        // (prompt memory)
        promptMemory() {
            return JSON.stringify(this.prompts);
        }
    }

    Scratch.extensions.register(new BoatE());
})(Scratch);
