import AccountDAO, { AccountDAODatabase } from "./AccountDAO";

export default class GetAccount {

	constructor (readonly accountDAO: AccountDAO) {
	}

	async execute (accountId: string) {
		const accountDAO = new AccountDAODatabase();
		const account = await accountDAO.getById(accountId);
		// account.is_passenger = account.isPassenger;
		// account.is_driver = account.isDriver;
		return account;
	}
}
