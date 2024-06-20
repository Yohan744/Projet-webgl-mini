import Experience from "../Experience";

const interactableObjects = {};
const interactableMesh = [];

export default class ObjectsInteractable {

    constructor(materialLibrary) {
        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.scene = this.experience.scene;
        this.materialLibrary = materialLibrary;
        this.gameManager = this.experience.gameManager;

        if (this.scene) {
            this.init();
        }
    }

    init() {

        this.objectsInteractableModel = this.resources.items.objectsInteractableModel.scene;

        this.objectsInteractableModel.traverse(child => {
            if (child.isMesh) {
                const name = child.name.toLowerCase();
                child.material.dispose();

                if (name.includes("walkman")) {
                    child.material = this.materialLibrary.getWalkmanMaterial();

                } else if (name.includes("tirroir")) {
                    child.material = this.materialLibrary.getDrawerMaterial();

                } else if (name.includes("cartepostale") || name.includes('cartespostales')) {
                    if (name.includes('biarritz')) {
                        child.material = this.materialLibrary.getPostalCardBiarritzMaterial();
                    }
                    if (name.includes('plage')) {
                        child.material = this.materialLibrary.getPostalCardBeachMaterial();
                    }
                    if (name.includes('maison')) {
                        child.material = this.materialLibrary.getPostalCardHouseMaterial();
                    }

                } else if (name.includes("dahlia")) {
                    child.material = this.materialLibrary.getDahliaMaterial();

                } else if (name.includes("magazine")) {
                    if (name.includes('ouvert')) child.material = this.materialLibrary.getOpenMagazineMaterial();
                    if (name.includes('fermé')) child.material = this.materialLibrary.getClosedMagazineMaterial();

                } else if (name.includes("malle")) {
                    if (name.includes('haut')) {
                        child.material = this.materialLibrary.getTopChestMaterial();
                    }

                    if (name.includes('bas')) {
                        child.material = this.materialLibrary.getBottomChestMaterial();

                    }

                } else if (name.includes("bobine1") || name.includes("bobine2") || name.includes("bobine3")) {
                    child.material = this.materialLibrary.getBlackMaterial();

                } else if (name === 'corps') {
                    child.material = this.materialLibrary.getCassetteMaterial();

                } else if (name.includes("crayon")) {
                    child.material = this.materialLibrary.getPencilMaterial();


                } else if (name.includes("telephone")) {
                    child.material = this.materialLibrary.getTelephoneMaterial();

                } else if (name.includes("rubicub")) {
                    child.material = this.materialLibrary.getRubiksCubeMaterial();

                } else if (name.includes("tv")) {
                    child.material = this.materialLibrary.getTvMaterial();

                } else if (name.includes("enveloppe")) {
                    child.material = this.materialLibrary.getEnveloppeMaterial();

                } else if (name.includes("lettre")) {
                    child.material = this.materialLibrary.getLetterMaterial();

                } else if (name.includes("tableau_magique1")) {
                    child.material = this.materialLibrary.getTelecranMaterial();

                } else if (name.includes("tourne_disque")) {
                    child.material = this.materialLibrary.getRecordPlayerMaterial();

                } else if (name.includes("rail_diapo") || name.includes("tireuse") || name.includes("boutonon") || name.includes("cube") || name.includes("oeil") || name === 'boite001' || name === 'porte') {

                    if (name.includes("oeil")) child.material = this.materialLibrary.getProjectorOeilMaterial()
                    if (name.includes("boite001")) child.material = this.materialLibrary.getProjectorBoxMaterial()
                    if (name.includes("tireuse")) child.material = this.materialLibrary.getProjectorTireuseMaterial()
                    if (name.includes("boutonon")) child.material = this.materialLibrary.getProjectorButtonMaterial()
                    if (name.includes("cube")) child.material = this.materialLibrary.getProjectorCubeMaterial()
                    if (name === 'porte') child.material = this.materialLibrary.getProjectorDoorMaterial()
                    if (name.includes("rail_diapo")) child.material = this.materialLibrary.getProjectorRailMaterial()

                } else if (name === 'vynyle' || name === 'vynyle1') {
                    if (name === 'vynyle') child.material = this.materialLibrary.getVinylMaterial();
                    if (name === 'vynyle1') child.material = this.materialLibrary.getVinylUpMaterial();

                } else if (name === 'photo') {
                    child.material = this.materialLibrary.getPictureMaterial()

                } else {
                    console.log(name);
                }

                child.material.needsUpdate = true

            }
        });

        this.scene.add(this.objectsInteractableModel)

    }

    destroy() {
        if (this.objectsInteractableModel) {
            this.objectsInteractableModel.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose()
                    child.material.dispose()
                }
            });
            this.scene.remove(this.objectsInteractableModel);
        }
        Object.keys(interactableObjects).forEach(key => {
            if (interactableObjects[key].destroy) {
                interactableObjects[key].destroy();
            }
        });
    }

}

export const useInteractableObjects = () => interactableObjects;
export const getInteractablesMesh = () => interactableMesh;
