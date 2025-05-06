import mongoose, {Schema, Document, Types} from 'mongoose'

export interface Category extends Document{
    name: string;
    parentCategory?: Types.ObjectId | null;
    slug: string
}

const CategorySchema : Schema<Category> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
})

const CategoryModel = 
    (mongoose.models.Category as mongoose.Model<Category>) ||
    mongoose.model<Category>('Category', CategorySchema)

export default CategoryModel