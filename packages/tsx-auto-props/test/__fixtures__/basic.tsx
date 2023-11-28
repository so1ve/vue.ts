import { defineComponent } from "vue";

interface Props<T> {
	a: number;
	b: {
		some: boolean;
	};
}

type P1 = {
	a: 1;
};

const Foo = defineComponent(<T,>(props: Props<T>) => {
	return () => <div>{props}</div>;
});

const Bar = defineComponent((props: P1) => {
	return () => <div>{props}</div>;
});
