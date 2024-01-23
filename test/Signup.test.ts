import AccountDAO, { AccountDAODatabase, AccountDAOMemory } from "../src/AccountDAO";
import GetAccount from "../src/GetAccount";
import MailerGateway from "../src/MailerGateway";
import Signup from "../src/Signup";
import sinon from "sinon";

let signup: Signup;
let getAccount: GetAccount;

// integration test com uma granularidade mais fina
beforeEach(() => {
	const accountDAO = new AccountDAODatabase();
	signup = new Signup(accountDAO);
	getAccount = new GetAccount(accountDAO);
});

test("Deve criar a conta de um passageiro", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	const outputSignup = await signup.execute(input);
	expect(outputSignup.accountId).toBeDefined();
	const outputGetAccount = await getAccount.execute(outputSignup.accountId);
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	expect(outputGetAccount.is_passenger).toBe(input.isPassenger);
});

test("Deve criar a conta de um motorista", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		carPlate: "AAA9999",
		isDriver: true
	};
	const outputSignup = await signup.execute(input);
	expect(outputSignup.accountId).toBeDefined();
	const outputGetAccount = await getAccount.execute(outputSignup.accountId);
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	expect(outputGetAccount.is_driver).toBe(input.isDriver);
});

test("Não deve criar um passageiro se o nome for inválido", async function () {
	const input = {
		name: "John",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid name"));
});

test("Não deve criar um passageiro se o email for inválido", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}`,
		cpf: "97456321558",
		isPassenger: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid email"));
});

test("Não deve criar um passageiro se o cpf for inválido", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "974563215",
		isPassenger: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid cpf"));
});

test("Não deve criar um passageiro se a conta já existe", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	await signup.execute(input);
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Account already exists"));
});

test("Não deve criar a conta de um motorista se a placa for inválida", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		carPlate: "AAA999",
		isDriver: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid car plate"));
});

test("Deve criar a conta de um passageiro stub", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	const saveStub = sinon.stub(AccountDAODatabase.prototype, "save").resolves();
	const getByEmailStub = sinon.stub(AccountDAODatabase.prototype, "getByEmail").resolves();
	const getByIdStub = sinon.stub(AccountDAODatabase.prototype, "getById").resolves(input);
	const outputSignup = await signup.execute(input);
	expect(outputSignup.accountId).toBeDefined();
	const outputGetAccount = await getAccount.execute(outputSignup.accountId);
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	saveStub.restore();
	getByEmailStub.restore();
	getByIdStub.restore();
});

test("Deve criar a conta de um passageiro spy", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	const saveSpy = sinon.spy(AccountDAODatabase.prototype, "save");
	const sendSpy = sinon.spy(MailerGateway.prototype, "send");
	const outputSignup = await signup.execute(input);
	expect(outputSignup.accountId).toBeDefined();
	const outputGetAccount = await getAccount.execute(outputSignup.accountId);
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	expect(saveSpy.calledOnce).toBe(true);
	expect(saveSpy.calledWith(input)).toBe(true);
	expect(sendSpy.calledOnce).toBe(true);
	expect(sendSpy.calledWith("Welcome", input.email, "Use this link to confirm your account"));
	saveSpy.restore();
	sendSpy.restore();
});

test("Deve criar a conta de um passageiro mock", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	const mailerGatewayMock = sinon.mock(MailerGateway.prototype);
	mailerGatewayMock.expects("send").withArgs("Welcome", input.email, "Use this link to confirm your account").once();
	const outputSignup = await signup.execute(input);
	expect(outputSignup.accountId).toBeDefined();
	const outputGetAccount = await getAccount.execute(outputSignup.accountId);
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	mailerGatewayMock.verify();
	mailerGatewayMock.restore();
});
