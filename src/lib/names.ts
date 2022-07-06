import { factory } from 'typescript';

export const standardControl = "ComponentFramework.StandardControl"
export const reactControl = "ComponentFramework.ReactControl"
export const inputParam = "IInputs"
export const outputParam = "IOutputs"

export const currentScriptName = factory.createIdentifier("_pcfReloadCurrentScript")
export const injectLibName = factory.createIdentifier("_pcfReloadLib")
export const controlLibName = factory.createIdentifier("_pcfReloadControl")
