import { Op, where } from 'sequelize';
import db from '../models';
import { pagingConfig } from '../utils/pagination';
export const getPosts = (
    postId,
    { page, pageSize, orderBy, orderDirection, userId, title }
) =>
    new Promise(async (resolve, reject) => {
        try {
            const queryPaging = pagingConfig(
                page,
                pageSize,
                orderBy,
                orderDirection
            );
            const query = {};
            if (postId) query.where = { id: postId };
            if (title) query.where.title = { [Op.substring]: userName };
            if (userId)
                query.include = [
                    {
                        model: db.User,
                        attributes: ['id', 'userName', 'fullName', 'avatar'],
                        where: { id: userId },
                    },
                ];
            else
                query.include = [
                    {
                        model: db.User,
                        attributes: ['id', 'userName', 'fullName', 'avatar'],
                    },
                ];
            const posts = await db.Post.findAll(
                Object.assign(query, queryPaging)
            );
            const totalItems = await db.Post.count(query);
            const totalPages =
                totalItems / pageSize >= 1
                    ? Math.ceil(totalItems / pageSize)
                    : 1;
            resolve({
                posts,
                pagination: {
                    orderBy: queries.orderBy,
                    page: queries.offset + 1,
                    pageSize: queries.limit,
                    orderDirection: queries.orderDirection,
                    totalItems,
                    totalPages,
                },
            });
        } catch (error) {
            reject(error);
        }
    });
export const insertPost = (
    poster,
    title,
    thumnailUrl,
    thumnailId,
    videoUrl,
    videoId
) =>
    new Promise((resolve, reject) => {
        try {
            const resp = db.Post.create({
                poster,
                title,
                thumnailUrl,
                thumnailId,
                videoUrl,
                videoId,
            });
            resolve(resp);
        } catch (error) {
            reject(error);
        }
    });
export const removePost = (id) =>
    new Promise(async (resolve, reject) => {
        try {
            const resp = await db.Post.destroy({
                where: {
                    id,
                },
            });
            resolve(resp);
        } catch (error) {
            reject(error);
        }
    });
