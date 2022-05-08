import { factory } from 'typescript';

export const baseClass = "ComponentFramework.StandardControl"
export const inputParam = "IInputs"
export const outputParam = "IOutputs"

export const currentScriptName = factory.createIdentifier("_pcfReloadCurrentScript")
export const injectLibName = factory.createIdentifier("_pcfReloadLib")