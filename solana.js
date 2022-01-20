import {
    clusterApiUrl, Transaction, Connection,
    sendAndConfirmTransaction, LAMPORTS_PER_SOL,
    PublicKey, SystemProgram
} from "@solana/web3.js";

export const createConnection = () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    return connection;
}

export const getWalletBalance = async (publicKey) => {
    const connection = createConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
}

export const transferSOL = async (fromWalet, toWalet, fromWaletSecret, sol) => {
    const connection = createConnection();

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey(fromWalet),
            toPubkey: new PublicKey(toWalet),
            lamports: LAMPORTS_PER_SOL * sol
        }));
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [{
            publicKey: fromWalet,
            secretKey: fromWaletSecret,
        }]
    );
    return signature;

}

export const airDropSol = async (walet, sol) => {
    const connection = createConnection();
    const lamports = sol * LAMPORTS_PER_SOL;
    let airdropSignature = await connection.requestAirdrop(walet, lamports);
    await connection.confirmTransaction(airdropSignature);
}
