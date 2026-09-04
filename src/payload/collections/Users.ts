import type { CollectionConfig } from "payload";
import { authenticated } from "../access/authenticated";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Usuario",
    plural: "Usuarios",
  },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Administración",
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    create: async ({ req }) => {
      if (req.user) {
        return true;
      }

      const { totalDocs } = await req.payload.count({
        collection: "users",
        overrideAccess: true,
      });

      return totalDocs === 0;
    },
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nombre",
      required: true,
    },
  ],
};
