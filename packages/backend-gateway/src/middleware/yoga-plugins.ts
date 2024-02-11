import { EnvelopArmor } from "@escape.tech/graphql-armor";

const armor = new EnvelopArmor();
const protection = armor.protect();

export const yogaPlugins = [...protection?.plugins];
