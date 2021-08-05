import fs from "fs";
import path from "path";

interface File {
	name: string;
	file: string;
}

interface Category {
	name?: string | null;
	file: string;
	files: File[];
}

export default class Wiki {
	public dir: string;
	public categories: Category[];

	constructor(dir: string) {
		this.dir = path.resolve(__dirname, dir);

		this.categories = [
			{
				name: null,
				file: "",
				files: [
					{
						name: "Home",
						file: "Home.ejs",
					},
					{
						name: "FAQ",
						file: "FAQ.ejs",
					},
					{
						name: "Contributing",
						file: "Contributing.ejs",
					},
					{
						name: "Donating",
						file: "Donating.ejs",
					},
				],
			},
		];

		const baseDir = fs.readdirSync(this.dir);

		// Directories can only go one deep
		baseDir.forEach((file: string) => {
			if (file.endsWith(".ejs")) return;

			const newDir = fs.readdirSync(path.join(this.dir, file));

			const category: Category = {
				name: this.clean(file),
				file,
				files: [],
			};

			newDir.forEach((newFile: string) => {
				if (newFile.endsWith(".ejs"))
					category.files.push({
						name: this.clean(newFile),
						file: newFile,
					});
			});

			this.categories.push(category);
		});
	}

	private clean(input: string) {
		return input.replace("-", " ").replace(".ejs", "");
	}

	public findCategory(file: string): Category | undefined {
		return this.categories.find(
			(category) => category.file.toLowerCase() == file.toLowerCase()
		);
	}

	public findPage(category: Category, page: string): File | undefined {
		return category.files.find(
			(file) =>
				file.file.replace(".ejs", "").toLowerCase() ==
				page.toLowerCase()
		);
	}
}
