export interface Events {
	(event: "foo"): void;
	(event: 1 extends 2 ? "bar" : "baz"): void;
	(event: Alias): void;
	(event: 'quote"'): void;
}

type Alias = "qux";
