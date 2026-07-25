import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema/app.js";
import { db } from "../db/index.js";

const router = express.Router();


// GET ALL SUBJECTS WITH OPTIONAL SEARCH, FILTERING AND PAGINATION
router.get('/', async(req,res) => {
    try {
        // Extract optional query parameters from the request.
        // Defaults are used if page or limit are not provided.
        const {search, department, page = 1, limit=10} = req.query

        // Normalize page and limit to numeric values and ensure minimum of 1.
        const parsedPage = Number(page)
        const parsedLimit = Number(limit)
        const currentPage = Math.max(1, Number.isFinite(parsedPage) ? parsedPage : 1)
        const limitPerPage = Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 10)

        const offset = (currentPage - 1) * limitPerPage

        const filterConditions = []

        // If search query exists, filter subjects by name or code.
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }
        // if department filter exists, match department name
        if (department) {
            filterConditions.push(ilike(departments.name, `%${department}%`))
        }


        // Combine all filter conditions with AND, or leave undefined if none exist.
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.select({count: sql<number>`count(*)`}).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id)).where(whereClause)

        const totalCount = countResult[0]?.count ?? 0;

        // Query the matching subject rows and include the joined department fields.
        const subjectsList = await db.select({...getTableColumns(subjects), department: {...getTableColumns(departments)}}).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id)).where(whereClause).orderBy(desc(subjects.createdAt)).limit(limitPerPage).offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            }
        })
    } catch (error) {
        console.error(`GET /Subjects error: ${error}`);
        return res.status(500).json({
            error: 'Failed to get Subjects'
        })
    }
})

export default router;