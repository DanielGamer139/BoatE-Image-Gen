(function (Scratch) {
    "use strict";

    class BoatE {
        constructor() {
            // Your Cloudflare Worker endpoint
            this.API = "https://boat-e-image-gen.danielmat639.workers.dev/image";
        }

        getInfo() {
            return {
                id: "BoatE",
                name: "Boat‑E Image Gen",
                color1: "#4BA3FF",
                color2: "#2C7CD1",
                color3: "#1A4F80",

                blocks: [
                    {
                        opcode: "generatePixelArt",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "generate pixel art [PROMPT]",
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "a tiny robot on a boat"
                            }
                        }
                    },
                    {
                        opcode: "generatePixelArtCostume",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set sprite costume to pixel art [PROMPT]",
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "pixel robot"
                            }
                        }
                    }
                ]
            };
        }

        /**
         * Core function: calls your Cloudflare Worker and returns base64 PNG.
         */
        async generateImage(prompt) {
            try {
                const response = await fetch(this.API, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt })
                });

                const data = await response.json();

                if (!data.success) {
                    console.error("[Boat‑E] Worker error:", data.error);
                    return "";
                }

                return data.image; // base64 PNG
            } catch (err) {
                console.error("[Boat‑E] Failed to generate image:", err);
                return "";
            }
        }

        /**
         * REPORTER BLOCK
         * Returns base64 PNG string.
         */
        async generatePixelArt(args) {
            const prompt = args.PROMPT;
            return await this.generateImage(prompt);
        }

        /**
         * COMMAND BLOCK
         * Sets the sprite's costume to the generated pixel art.
         */
        async generatePixelArtCostume(args, util) {
            const prompt = args.PROMPT;
            const base64 = await this.generateImage(prompt);

            if (!base64) return;

            // Convert base64 → costume
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
    }

    Scratch.extensions.register(new BoatE());
})(Scratch);
