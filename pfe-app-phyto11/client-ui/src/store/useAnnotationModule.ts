import {
  AnnotationUpdateInput,
  AnnotationCreateInput,
  Annotation,
} from "./../../index";
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
const initialState:
  | Annotation
  | AnnotationCreateInput
  | AnnotationUpdateInput = {
  aimodel: { id: "" },
  image: { id: "" },
  validatedBy: { id: "" },
};
export const useAnnotationStore = defineStore("annotation-store", {
  state: () => {
    return {
      annotationList: [] as Array<Annotation>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      annotation: _.cloneDeep(initialState) as
        | Annotation
        | AnnotationCreateInput
        | AnnotationUpdateInput,
      annotationExcelFile: "" as string,
      annotationPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchAnnotations(payload?: IPagination) {
      try {
        const { data } = await service.nest.annotationControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.annotationList = data.paginatedResult;

        this.annotationList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.annotationPagination = {
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
        this.annotationList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelAnnotations() {
      try {
        const {
          data,
        } = await service.nest.annotationControllerFindDataForExcel();
        this.annotationExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteAnnotation(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.annotationControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchAnnotations({
          take: this.annotationPagination.take,
          skip: this.annotationPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteAnnotation(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.annotationControllerDelete(payload);
        this.annotationList = this.annotationList.filter(
          (annotation) => annotation.id !== data.id
        );
        this.annotationPagination.total--;
        this.isLoading = false;
        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async editAnnotation(payload: {
      id: string;
      data?: AnnotationUpdateInput;
    }) {
      this.isLoading = true;
      try {
        const editAnnotationData: AnnotationUpdateInput =
          payload.data ?? this.annotation;
        editAnnotationData.aimodel =
          editAnnotationData.aimodel &&
          editAnnotationData.aimodel.id?.length > 0
            ? editAnnotationData.aimodel
            : undefined;
        editAnnotationData.image =
          editAnnotationData.image && editAnnotationData.image.id?.length > 0
            ? editAnnotationData.image
            : undefined;
        editAnnotationData.validatedBy =
          editAnnotationData.validatedBy &&
          editAnnotationData.validatedBy.id?.length > 0
            ? editAnnotationData.validatedBy
            : undefined;
        const { data } = await service.nest.annotationControllerUpdate(
          payload.id,
          editAnnotationData
        );
        this.annotationList = this.annotationList.map((item) =>
          item.id === payload.id ? { ...item, ...data } : item
        );
        this.error = null;
      } catch (err: any) {
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    } /*
      async editManyAnnotation(payload: { data: AnnotationUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.nest.annotationControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.annotationList = this.annotationList.map((item) =>
            item.id === payload.id ? { ...item, ...payload.data } : item
          );
          this.error = null;
        } catch (err:any) {
          console.error("Error Update  ITEMS", err.error);
          this.error = err.error;
        } finally {
          this.isLoading = false;
        }
      },*/,

    async getAnnotationById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.annotationControllerFindOne(payload);
        this.annotation = {
          ...data,
          aimodel: data.aimodel ? data.aimodel : { id: "" },
          image: data.image ? data.image : { id: "" },
          validatedBy: data.validatedBy ? data.validatedBy : { id: "" },
        };
        this.error = null;
      } catch (err: any) {
        this.resetAnnotation();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createAnnotation(payload?: { data: AnnotationCreateInput }) {
      this.isLoading = true;
      try {
        const createAnnotationData: AnnotationCreateInput =
          payload?.data ?? (this.annotation as AnnotationCreateInput);
        createAnnotationData.aimodel =
          createAnnotationData.aimodel &&
          createAnnotationData.aimodel.id?.length > 0
            ? createAnnotationData.aimodel
            : undefined;
        createAnnotationData.image =
          createAnnotationData.image &&
          createAnnotationData.image.id?.length > 0
            ? createAnnotationData.image
            : undefined;
        createAnnotationData.validatedBy =
          createAnnotationData.validatedBy &&
          createAnnotationData.validatedBy.id?.length > 0
            ? createAnnotationData.validatedBy
            : undefined;
        const { data } = await service.nest.annotationControllerCreate(
          createAnnotationData
        );
        this.annotation = {
          ...data,
          aimodel: data.aimodel ? data.aimodel : { id: "" },
          image: data.image ? data.image : { id: "" },
          validatedBy: data.validatedBy ? data.validatedBy : { id: "" },
        };
        this.annotationList = [...this.annotationList, data];
        this.error = null;
        return data;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyAnnotation(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.nest.annotationControllerCreateMany(
          payload
        );
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetAnnotation() {
      this.$reset();
    },
    disposeAnnotation() {
      this.$dispose();
    },
  },
});
