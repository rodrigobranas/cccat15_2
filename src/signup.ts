import crypto from "crypto";
import { validateCpf } from "./validateCpf";
import AccountDAO, { AccountDAODatabase } from "./AccountDAO";
import MailerGateway from "./MailerGateway";

export default class Signup {
	// Port
	constructor (readonly accountDAO: AccountDAO) {
	}

	async execute (input: any) {
		input.accountId = crypto.randomUUID();
		const accountDAO = new AccountDAODatabase();
		const existingAccount = await accountDAO.getByEmail(input.email);
		if (existingAccount) throw new Error("Account already exists");
		if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) throw new Error("Invalid name");
		if (!input.email.match(/^(.+)@(.+)$/)) throw new Error("Invalid email");
		if (!validateCpf(input.cpf)) throw new Error("Invalid cpf");
		if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/)) throw new Error("Invalid car plate");
		await accountDAO.save(input);
		const mailerGateway = new MailerGateway();
		mailerGateway.send("Welcome", input.email, "Use this link to confirm your account");
		return {
			accountId: input.accountId
		};
	}
}
