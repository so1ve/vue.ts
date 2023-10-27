export interface SomeInterface {
	emptyInterface: EmptyInterface;
	conditionalNumber: ConditionalNumber;
	interface: Interface;
}

interface EmptyInterface {}
type ConditionalNumber = number extends boolean ? string : number;
interface Interface {
	aaa: 1;
}
interface InterfaceExtends extends Interface {}
