
import { addUserSeedData } from "./data/User/User-ts"
import { addAppConfigSeedData } from "./data/AppConfig/AppConfig-ts"
import { addProjectSeedData } from "./data/Project/Project-ts"
import { addImageSeedData } from "./data/Image/Image-ts"
import { addAiModelSeedData } from "./data/AiModel/AiModel-ts"
import { addAnnotationSeedData } from "./data/Annotation/Annotation-ts"
import { addCollaboratorSeedData } from "./data/Collaborator/Collaborator-ts"

export const pushSeed = async() => {
    await addUserSeedData()
	await addAppConfigSeedData()
	await addProjectSeedData()
	await addImageSeedData()
	await addAiModelSeedData()
	await addAnnotationSeedData()
	await addCollaboratorSeedData()

}
pushSeed()
        