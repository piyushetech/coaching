import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sankalp';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected:', uri);
}

export function mapDoc(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj._id?.toString() ?? obj.id;
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
}

export function mapDocs(docs) {
  return docs.map(mapDoc);
}
