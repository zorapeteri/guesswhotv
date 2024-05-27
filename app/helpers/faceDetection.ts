import { CastMember } from "~/types/cast"
import * as faceapi from "face-api.js"
import { getCharacterImage } from "./getCharacterImage"

function setImmediateInterval(cb: () => void, ms: number) {
  cb()
  return setInterval(cb, ms)
}

const waitForElementWithId = (id: string): Promise<HTMLElement> =>
  new Promise((resolve) => {
    let interval: NodeJS.Timeout | undefined = undefined
    interval = setImmediateInterval(() => {
      const element = document.getElementById(id)
      if (element !== null) {
        if (interval) {
          clearInterval(interval)
        }
        resolve(element)
      }
    }, 100)
  })

export async function detectFaces(castMembers: CastMember[]) {
  await faceapi.loadTinyFaceDetectorModel("/models")

  await Promise.all(
    castMembers.map(async (castMember) => {
      const element = await waitForElementWithId(
        castMember.character.id.toString()
      )
      const imgSource = getCharacterImage(castMember)
      if (imgSource === undefined) {
        return
      }
      const image = await faceapi.fetchImage(imgSource)
      const detection = await faceapi.detectSingleFace(
        image,
        new faceapi.TinyFaceDetectorOptions()
      )
      if (detection === undefined) {
        return
      }
      const box = detection.relativeBox
      const xCenter = box.x + box.width / 2
      const yCenter = box.y + box.height / 2
      element.style.backgroundPositionX = xCenter * 100 + "%"
      element.style.backgroundPositionY = yCenter * 100 + "%"
    })
  )
}
