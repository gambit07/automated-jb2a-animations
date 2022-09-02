import { buildFile } from "../file-builder/build-filepath.js";
import { aaDebugger } from "../../constants/constants.js";
import { AAAnimationData } from "../../aa-classes/AAAnimationData.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function dualSeq(handler, animationData) {
    const aaDebug = game.settings.get("autoanimations", "debug")

    // Sets JB2A database and Global Delay
    let globalDelay = game.settings.get("autoanimations", "globaldelay");
    await wait(globalDelay);

    //const daData =  handler.flags?.preset?.dualattach;
    const data = animationData.primary;

    const daData = data.isAuto ? handler.autorecObject?.dualattach : handler.flags?.preset?.dualattach;

    if (!daData) { return; }
    const cleanData = {
        menuType: daData.menuType || "spell",
        animation: daData.animation || "witchbolt",
        variant: daData.variant || "01",
        color: daData.color || "blue",
        customPath: daData.enableCustom && daData.customPath ? daData.customPath : false,
        below: daData.below || false,
        onlyX: daData.onlyX || false,
        playbackRate: daData.playbackRate || 1,
    }

    const sourceFX = animationData.sourceFX;
    /*
    if (data.isAuto) {
        data.itemName = data.subAnimation || "";
    } else {
        data.itemName = data.options?.name || "";
    }
    */
    const animFile = await buildFile(false, cleanData.menuType, cleanData.animation, "range", cleanData.variant, cleanData.color, cleanData.customPath)

    if (handler.debug) { aaDebugger("Dual Attach Animation Start", animationData, animFile) }

    const onlyX = cleanData.enableCustom ? cleanData.onlyX : false;

    const sourceToken = handler.sourceToken;
    let effectExists = Sequencer.EffectManager.getEffects({ object: sourceToken, origin: handler.itemUuid })
    if (aaDebug) { aaDebugger("Dual Attach Animation Start", data, cleanData, animFile) }
    async function cast() {

        let aaSeq = new Sequence();
        // Play Macro if Awaiting
        if (data.playMacro && data.macro.playWhen === "1") {
            let userData = data.macro.args;
            aaSeq.macro(data.macro.name, handler.workflow, handler, userData)
        }
        // Extra Effects => Source Token if active
        if (sourceFX.enabled) {
            aaSeq.addSequence(sourceFX.sourceSeq)
        }
        if (data.playSound) {
            aaSeq.addSequence(await AAAnimationData._sounds({ animationData }))
        }
        // Animation Start Hook
        aaSeq.thenDo(function () {
            Hooks.callAll("aa.animationStart", sourceToken, handler.allTargets)
        })
        for (let target of handler.allTargets) {
            let checkTarget = effectExists.filter(i => i.data.target.includes(target.id)).length > 0;
            if (!checkTarget) {
            aaSeq.effect()
                .file(animFile.file)
                .attachTo(sourceToken)
                .stretchTo(target, { attachTo: true, onlyX: onlyX })
                .persist(true)
                .playbackRate(cleanData.playbackRate)
                .origin(handler.itemUuid)
                .belowTokens(cleanData.below)
                //.playIf(!checkTarget)
            }
        }
        if (data.playMacro && data.macro.playWhen === "0") {
            let userData = data.macro.args;
            new Sequence()
                .macro(data.macro.name, handler.workflow, handler, userData)
                .play()
        }
        aaSeq.play()
        //Hooks.callAll("aa.animationEnd", sourceToken, handler.allTargets)
    }
    cast()
}
