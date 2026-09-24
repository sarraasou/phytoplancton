import { ImageUpdateInput, ImageCreateInput, Image } from "./../../index";
import { defineStore } from "pinia";
import service from "@/service";
import { storeToRefs } from "pinia";
import { useBodyStore } from "@/store/useBodyModule";
import _ from "lodash";

interface IPagination {
  take?: number;
  skip?: number;
}
const { isLoading } = storeToRefs(useBodyStore());
const initialState: Image | ImageCreateInput | ImageUpdateInput = {
  name: "",
  project: { id: "" },
};
export const useImageStore = defineStore("image-store", {
  state: () => {
    return {
      imageList: [] as Array<Image>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      image: _.cloneDeep(initialState) as
        | Image
        | ImageCreateInput
        | ImageUpdateInput,
      imageExcelFile: "" as string,
      imagePagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchImages(payload?: IPagination) {
      try {
        const { data } = await service.nest.imageControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.imageList = data.paginatedResult;

        this.imageList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.imagePagination = {
          total: data.totalCount,
          skip: payload?.skip ?? 0,
          take: payload?.take ?? data.totalCount,
        };
        localStorage.setItem(
          "take",
          payload?.take?.toString() ?? data.totalCount.toString()
        );
        this.error = null;
      } catch (err: any) {
        this.imageList = [];
        console.error("Error loading ITEMS", err);
        // ✅ Fix: récupère le vrai message d'erreur
        this.error = err?.response?.data ?? err?.error ?? err;
      }
    },

    async fetchDataExcelImages() {
      try {
        const { data } = await service.nest.imageControllerFindDataForExcel();
        this.imageExcelFile = data.file;
        this.error = null;
      } catch (err: any) {
        console.error("Error loading ITEMS", err);
        this.error = err?.response?.data ?? err?.error ?? err;
      } finally {
        this.isLoading = false;
      }
    },

    async softDeleteImage(payload: string) {
      this.isLoading = true;
      try {
        await service.nest.imageControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchImages({
          take: this.imagePagination.take,
          skip: this.imagePagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading ITEMS", err);
        this.error = err?.response?.data ?? err?.error ?? err;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteImage(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.imageControllerDelete(payload);
        this.imageList = this.imageList.filter((image) => image.id !== data.id);
        this.imagePagination.total--;
        this.error = null;
      } catch (err: any) {
        console.error("Error loading ITEMS", err);
        this.error = err?.response?.data ?? err?.error ?? err;
      } finally {
        this.isLoading = false;
      }
    },

    async editImage(payload: { id: string; data?: ImageUpdateInput }) {
      this.isLoading = true;
      try {
        const editImageData: ImageUpdateInput = payload.data ?? this.image;
        editImageData.project =
          editImageData.project && editImageData.project.id?.length > 0
            ? { id: editImageData.project.id } // ✅ Envoie uniquement { id }
            : undefined;
        const { data } = await service.nest.imageControllerUpdate(
          payload.id,
          editImageData
        );
        this.imageList = this.imageList.map((item) =>
          item.id === payload.id ? { ...item, ...data } : item
        );
        this.error = null;
      } catch (err: any) {
        console.error("Error Update ITEMS", err);
        this.error = err?.response?.data ?? err?.error ?? err;
      } finally {
        this.isLoading = false;
      }
    },

    async getImageById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.imageControllerFindOne(payload);
        this.image = {
          ...data,
          project: data.project ? { id: data.project.id } : { id: "" },
        };
        this.error = null;
      } catch (err: any) {
        this.resetImage();
        console.error("Error GetById ITEMS", err);
        this.error = err?.response?.data ?? err?.error ?? err;
      } finally {
        this.isLoading = false;
      }
    },

    async createImage(payload?: { data: ImageCreateInput }) {
      this.isLoading = true;
      try {
        const raw = payload?.data ?? (this.image as ImageCreateInput);

        // ✅ Nettoie les champs auto-générés
        const {
          id: _id,
          createdAt: _c,
          updatedAt: _u,
          deletedAt: _d,
          ...createImageData
        } = raw as any;

        // ✅ Envoie uniquement { id } pour project
        createImageData.project =
          createImageData.project?.id?.length > 0
            ? { id: createImageData.project.id }
            : undefined;

        const { data } = await service.nest.imageControllerCreate(createImageData);
        this.imageList = [...this.imageList, data];
        this.error = null;
      } catch (err: any) {
        console.error("Error Create IMAGE", err);
        // ✅ Fix principal : err.error était undefined, on prend err.response.data
        this.error = err?.response?.data ?? err?.error ?? { message: "Erreur lors de la création" };
      } finally {
        this.isLoading = false;
      }
    },

    async createManyImage(payload: any) {
      this.isLoading = true;
      try {
        await service.nest.imageControllerCreateMany(payload);
        this.error = null;
      } catch (err: any) {
        this.error = err?.response?.data ?? err?.error ?? err;
      } finally {
        this.isLoading = false;
      }
    },

    resetImage() {
      this.$reset();
    },
    disposeImage() {
      this.$dispose();
    },
  },
});